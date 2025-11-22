import axios from 'axios';
import { Coordinates, LocationScore } from '../../schemas/bookingSchemas.js';

export class LocationScoreService {
    private apiKey: string;

    constructor() {
        this.apiKey = process.env.OPENROUTESERVICE_API_KEY || '';
        if (!this.apiKey) {
            console.warn('OPENROUTESERVICE_API_KEY is not set. LocationScoreService will use estimated metrics.');
        }
    }

    async checkLocationScore(housingCoords: Coordinates, targetCoords: Coordinates): Promise<LocationScore> {
        try {
            let walkingDistance = 0;
            let walkingTime = 0;

            // Try to get real walking metrics from OpenRouteService
            if (this.apiKey) {
                try {
                    const response = await axios.post(
                        'https://api.openrouteservice.org/v2/directions/foot-walking',
                        {
                            coordinates: [
                                [housingCoords.lng, housingCoords.lat],
                                [targetCoords.lng, targetCoords.lat]
                            ]
                        },
                        {
                            headers: {
                                'Authorization': this.apiKey,
                                'Content-Type': 'application/json'
                            }
                        }
                    );

                    if (response.data?.routes?.[0]) {
                        const route = response.data.routes[0];
                        walkingDistance = Math.round(route.summary.distance); // meters
                        walkingTime = Math.round(route.summary.duration / 60); // convert seconds to minutes
                    }
                } catch (apiError) {
                    console.warn('OpenRouteService API call failed, using Haversine estimation:', apiError instanceof Error ? apiError.message : apiError);
                    // Fall back to Haversine formula
                    walkingDistance = this.haversineDistance(housingCoords, targetCoords);
                    walkingTime = Math.round(walkingDistance / 83.3); // ~5 km/h walking speed = 83.3 m/min
                }
            } else {
                // No API key, use Haversine estimation
                walkingDistance = this.haversineDistance(housingCoords, targetCoords);
                walkingTime = Math.round(walkingDistance / 83.3); // ~5 km/h walking speed = 83.3 m/min
            }

            // Estimate transit time: transit_time_seconds = walking_distance_meters / 3
            const transitTime = Math.round((walkingDistance / 3) / 60); // convert to minutes

            // Compute a deterministic proximity score and reasoning (no LLM)
            return this.computeProximityScore(walkingDistance, walkingTime, transitTime);
        } catch (error) {
            console.error('LocationScoreService Error:', error);
            throw error;
        }
    }

    private computeProximityScore(walkingDistance: number, walkingTime: number, transitTime: number): LocationScore {
        // Use the faster of walking vs transit as the primary "time to venue"
        const effectiveTime = Math.min(walkingTime, transitTime);

        let baseScore: number;
        let qualitative: string;

        if (effectiveTime <= 5) {
            baseScore = 98;
            qualitative = 'excellent proximity';
        } else if (effectiveTime <= 10) {
            baseScore = 90;
            qualitative = 'great proximity';
        } else if (effectiveTime <= 15) {
            baseScore = 80;
            qualitative = 'good proximity';
        } else if (effectiveTime <= 25) {
            baseScore = 70;
            qualitative = 'decent proximity';
        } else if (effectiveTime <= 35) {
            baseScore = 60;
            qualitative = 'okay proximity';
        } else if (effectiveTime <= 45) {
            baseScore = 50;
            qualitative = 'far but still manageable';
        } else if (effectiveTime <= 60) {
            baseScore = 40;
            qualitative = 'quite far from the target';
        } else {
            baseScore = 25;
            qualitative = 'very far from the target';
        }

        // Additional penalty for very long walking distances (regardless of transit)
        if (walkingDistance > 8000) { // > 8km
            baseScore -= 15;
        } else if (walkingDistance > 5000) { // > 5km
            baseScore -= 8;
        }

        const proximity_score = Math.max(0, Math.min(100, Math.round(baseScore)));

        const distanceKm = walkingDistance / 1000;
        const reasonParts: string[] = [];

        reasonParts.push(
            `Walking distance is about ${distanceKm.toFixed(2)} km (roughly ${walkingTime} minutes on foot).`
        );
        reasonParts.push(
            `Estimated transit time is around ${transitTime} minutes.`
        );
        reasonParts.push(
            `Overall, this represents ${qualitative}.`
        );

        return {
            proximity_score,
            reason: reasonParts.join(' ')
        };
    }

    private haversineDistance(coords1: Coordinates, coords2: Coordinates): number {
        const toRad = (value: number) => value * Math.PI / 180;
        const R = 6371000; // Earth radius in meters
        const dLat = toRad(coords2.lat - coords1.lat);
        const dLon = toRad(coords2.lng - coords1.lng);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(coords1.lat)) * Math.cos(toRad(coords2.lat)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.round(R * c); // distance in meters
    }
}
