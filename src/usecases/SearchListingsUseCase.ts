import { BookingProvider } from '../interfaces/BookingProvider.js';
import { LLMProvider } from '../interfaces/LLMProvider.js';
import {
    TravelRequirements,
    TravelRequirementsSchema,
    SearchCriteria,
    EventLocation,
    CoworkingSpace,
    Listing,
    ListingInsights,
    SafetyEvaluation
} from '../schemas/bookingSchemas.js';

export class HttpError extends Error {
    statusCode: number;
    details?: unknown;

    constructor(statusCode: number, message: string, details?: unknown) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
    }
}

type AnchorConfig = {
    events: Record<string, EventLocation>;
    coworking: Record<string, CoworkingSpace[]>;
};

type ListingAspectScores = {
    overall: number;
    safety: number;
    coworkingProximity: number;
    eventProximity?: number;
};

type ScoredListing = {
    listing: Listing;
    scores: ListingAspectScores;
};

export class SearchListingsUseCase {
    private bookingService: BookingProvider;
    private llmService: LLMProvider;
    private anchors: AnchorConfig;

    constructor(dependencies: { bookingService: BookingProvider; llmService: LLMProvider; anchors: AnchorConfig }) {
        this.bookingService = dependencies.bookingService;
        this.llmService = dependencies.llmService;
        this.anchors = dependencies.anchors;
    }

    /**
     * Full LLM-driven search flow used by the /llm-search endpoint.
     *
     * Flow:
     * 1. Parse natural language message into TravelRequirements using the LLM.
     * 2. Derive structured SearchCriteria.
     * 3. Search potential listings via the booking provider.
     * 4. For each listing:
     *    - (Mock) assess coworking proximity in the area and derive a score.
     *    - Use the LLM to evaluate safety.
     *    - If an event was provided, compute distance to the event and derive a score.
     * 5. Compute an overall score per listing and an overall rating across all listings.
     */
    async searchFromMessage(message: string, options?: { event?: EventLocation }) {
        if (!message) {
            throw new HttpError(400, 'Message is required');
        }

        const requirements = await this.parseRequirementsWithRetry(message);
        const criteria = this.deriveSearchCriteria(requirements);

        const listings = await this.bookingService.searchListings(criteria);

        const { scoredListings, overallRating } = await this.evaluateListingsPipeline(
            listings,
            criteria,
            options?.event
        );

        return {
            derivedCriteria: criteria,
            overallRating,
            results: scoredListings
        };
    }

    async searchFromCriteria(criteria: SearchCriteria) {
        const event = this.resolveEvent(criteria);
        const coworkingSpaces = this.resolveCoworkingSpaces(criteria.city);

        const listings = await this.bookingService.searchListings(criteria);
        this.attachDistances(listings, event);

        await this.enrichWithInsights(listings, event, coworkingSpaces);
        this.sortListings(listings);

        return {
            derivedCriteria: criteria,
            listings
        };
    }

    private async parseRequirementsWithRetry(message: string, maxAttempts = 2): Promise<TravelRequirements> {
        let lastLLMResponse: unknown;

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                lastLLMResponse = await this.llmService.parseRequirements(message);
            } catch (err) {
                if (attempt === maxAttempts) {
                    throw new HttpError(502, 'LLM unavailable', err);
                }
                continue;
            }

            const parsed = TravelRequirementsSchema.safeParse(lastLLMResponse);
            if (parsed.success) {
                return parsed.data;
            }

            if (attempt === maxAttempts) {
                throw new HttpError(502, 'LLM response invalid', {
                    llmResponse: lastLLMResponse,
                    validationErrors: parsed.error.flatten()
                });
            }
        }

        throw new HttpError(502, 'Failed to derive requirements from LLM');
    }

    private deriveSearchCriteria(requirements: TravelRequirements): SearchCriteria {
        const city = requirements.destination.city ||
            requirements.destination.region ||
            requirements.destination.country ||
            requirements.destination.rawText;

        if (!city) {
            throw new HttpError(400, 'Destination city is required');
        }

        let checkInDate = requirements.dates.startDate;
        let checkOutDate = requirements.dates.endDate;

        if (requirements.dates.durationDays) {
            if (checkInDate && !checkOutDate) {
                const start = new Date(checkInDate);
                const end = new Date(start);
                end.setDate(start.getDate() + requirements.dates.durationDays);
                checkOutDate = end.toISOString().slice(0, 10);
            } else if (checkOutDate && !checkInDate) {
                const end = new Date(checkOutDate);
                const start = new Date(end);
                start.setDate(end.getDate() - requirements.dates.durationDays);
                checkInDate = start.toISOString().slice(0, 10);
            }
        }

        if (!checkInDate || !checkOutDate) {
            throw new HttpError(400, 'Check-in and check-out dates are required');
        }

        const travelerCount = requirements.travelers?.count;
        if (!travelerCount) {
            throw new HttpError(400, 'Traveler count is required to determine bedrooms');
        }

        const bedrooms = Math.max(1, Math.ceil(travelerCount / 2));

        const filters: SearchCriteria['filters'] = requirements.budget?.amount
            ? { maxPrice: requirements.budget.amount }
            : undefined;

        return {
            city,
            checkInDate,
            checkOutDate,
            bedrooms,
            filters
        };
    }

    private resolveEvent(criteria: SearchCriteria): EventLocation {
        if (criteria.events && criteria.events.length > 0) {
            return criteria.events[0];
        }

        const key = (criteria.city || '').toLowerCase();
        const anchor = this.anchors.events[key];
        if (anchor) {
            return anchor;
        }

        throw new HttpError(400, 'Event location is required for proximity analysis');
    }

    private resolveCoworkingSpaces(city: string): CoworkingSpace[] {
        const key = (city || '').toLowerCase();
        const spaces = this.anchors.coworking[key];

        if (spaces && spaces.length > 0) {
            return spaces;
        }

        throw new HttpError(400, 'Coworking spaces are required for proximity analysis');
    }

    private attachDistances(listings: Listing[], event: EventLocation) {
        if (!event.coordinates) return;

        listings.forEach(listing => {
            if (listing.coordinates) {
                const computedDistance = this.computeDistanceKm(
                    listing.coordinates.lat,
                    listing.coordinates.lng,
                    event.coordinates.lat,
                    event.coordinates.lng
                );

                if (!Number.isNaN(computedDistance)) {
                    listing.distanceToEvent = Number(computedDistance.toFixed(2));
                }
            }
        });
    }

    private async enrichWithInsights(listings: Listing[], event: EventLocation, coworkingSpaces: CoworkingSpace[]) {
        try {
            const insights = await this.llmService.analyzeListings(listings, { event, coworkingSpaces });
            const insightMap = new Map<string, ListingInsights>(insights.map(item => [item.listingId, item]));

            listings.forEach(listing => {
                const match = insightMap.get(listing.id);
                if (match) {
                    listing.insights = match;
                }
            });
        } catch (error) {
            // If LLM enrichment fails, surface the error rather than silently defaulting.
            throw new HttpError(502, 'Failed to enrich listings with LLM insights', error instanceof Error ? error.message : error);
        }
    }

    private sortListings(listings: Listing[]) {
        listings.sort((a, b) => {
            if (b.safetyScore !== a.safetyScore) return b.safetyScore - a.safetyScore;
            if (a.distanceToEvent !== b.distanceToEvent) return a.distanceToEvent - b.distanceToEvent;
            if (b.bedrooms !== a.bedrooms) return b.bedrooms - a.bedrooms;
            if (a.price !== b.price) return a.price - b.price;
            return b.workspaceScore - a.workspaceScore;
        });
    }

    /**
     * Orchestrates scoring for listings: safety, coworking proximity, and optional event proximity.
     * Returns per-listing scores plus an overall rating for the result set.
     */
    private async evaluateListingsPipeline(
        listings: Listing[],
        criteria: SearchCriteria,
        event?: EventLocation
    ): Promise<{ scoredListings: ScoredListing[]; overallRating: number }> {
        if (listings.length === 0) {
            return { scoredListings: [], overallRating: 0 };
        }

        // 1) Safety scores via LLM
        const safetyEvaluations: SafetyEvaluation[] = await Promise.all(
            listings.map(listing => this.llmService.evaluateSafety(listing))
        );

        const scoredListings: ScoredListing[] = listings.map((listing, index) => {
            const safetyEval = safetyEvaluations[index];
            const safetyScore = safetyEval.safety_score;

            // normalise to 0-10 scale for the Listing model (used elsewhere)
            listing.safetyScore = Number((safetyScore / 10).toFixed(1));

            // 2) Mock coworking distance & score
            const coworkingDistanceKm = this.mockCoworkingDistanceKm(criteria.city, listing);
            const coworkingProximity = this.scoreProximityByDistance(coworkingDistanceKm);

            // keep workspaceScore roughly aligned with coworking proximity
            listing.workspaceScore = Number((coworkingProximity / 10).toFixed(1));

            // 3) Optional event proximity
            let eventProximity: number | undefined;
            if (event?.coordinates && listing.coordinates) {
                const distanceKm = this.computeDistanceKm(
                    listing.coordinates.lat,
                    listing.coordinates.lng,
                    event.coordinates.lat,
                    event.coordinates.lng
                );
                listing.distanceToEvent = Number(distanceKm.toFixed(2));
                eventProximity = this.scoreProximityByDistance(distanceKm);
            }

            const overall = this.computeOverallScore({
                safety: safetyScore,
                coworkingProximity,
                eventProximity
            });

            const scores: ListingAspectScores = {
                overall,
                safety: safetyScore,
                coworkingProximity,
                ...(eventProximity !== undefined ? { eventProximity } : {})
            };

            return {
                listing,
                scores
            };
        });

        const overallRating = Math.round(
            scoredListings.reduce((sum, item) => sum + item.scores.overall, 0) / scoredListings.length
        );

        // Sort by overall score (descending)
        scoredListings.sort((a, b) => b.scores.overall - a.scores.overall);

        return { scoredListings, overallRating };
    }

    /**
     * Simple mock for coworking proximity: we don't actually query any real API yet.
     * For now, assume better coworking proximity in well-known cities, otherwise average.
     */
    private mockCoworkingDistanceKm(_city: string, listing: Listing): number {
        // If we have coordinates, pretend there is a coworking hub within a few km.
        if (listing.coordinates) {
            return 1.5; // 1.5km to nearest coworking space (mock)
        }
        // If no coordinates, assume it's further away.
        return 4.0;
    }

    /**
     * Convert a distance in KM to a 0–100 proximity score.
     */
    private scoreProximityByDistance(distanceKm: number): number {
        if (distanceKm <= 0.5) return 100;
        if (distanceKm <= 1) return 90;
        if (distanceKm <= 2) return 80;
        if (distanceKm <= 3) return 70;
        if (distanceKm <= 5) return 60;
        if (distanceKm <= 8) return 50;
        return 40;
    }

    private computeOverallScore(params: {
        safety: number;
        coworkingProximity: number;
        eventProximity?: number;
    }): number {
        const safetyNorm = params.safety; // already 0–100
        const coworking = params.coworkingProximity;
        const event = params.eventProximity ?? 70; // neutral default if no event

        const overall = 0.4 * safetyNorm + 0.3 * coworking + 0.3 * event;
        return Math.round(overall);
    }

    private computeDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const toRad = (value: number) => value * Math.PI / 180;
        const R = 6371; // Earth radius in km
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}


