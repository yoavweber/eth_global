import axios from 'axios';
import { BookingProvider, SearchCriteria, Listing, BookingDetails, BookingResult } from '../../interfaces/BookingProvider.js';

export class AirbnbService implements BookingProvider {
    private apiUrl: string;
    private apiKey: string;

    constructor() {
        this.apiUrl = 'https://www.searchapi.io/api/v1';
        this.apiKey = process.env.SEARCHAPI_IO_API_KEY || '';
        console.log('AirbnbService initialized. API Key present:', !!this.apiKey);
    }

    async searchListings(criteria: SearchCriteria): Promise<Listing[]> {
        console.log('AirbnbService: Searching listings for', criteria.city);

        if (!this.apiKey) {
            throw new Error('SEARCHAPI_IO_API_KEY is not set. Cannot query Airbnb search API.');
        }

        try {
            const params: any = {
                engine: 'airbnb',
                q: criteria.city,
                check_in_date: criteria.checkInDate,
                check_out_date: criteria.checkOutDate,
                adults: criteria.bedrooms, // Using bedrooms as proxy for adults if not specified
                currency: 'USD'
            };

            if (criteria.filters) {
                if (criteria.filters.minPrice) params.price_min = criteria.filters.minPrice;
                if (criteria.filters.maxPrice) params.price_max = criteria.filters.maxPrice;
            }

            console.log('AirbnbService: Making API request with params:', { ...params, apiKey: this.apiKey ? '***' : 'MISSING' });

            const response = await axios.get(`${this.apiUrl}/search`, {
                params,
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                }
            });

            console.log('AirbnbService: API response status:', response.status);
            console.log('AirbnbService: API response data keys:', Object.keys(response.data || {}));

            // Try different possible response structures
            let results: any[] = [];
            if (Array.isArray(response.data)) {
                results = response.data;
            } else if (response.data.search_results && Array.isArray(response.data.search_results)) {
                results = response.data.search_results;
            } else if (response.data.results && Array.isArray(response.data.results)) {
                results = response.data.results;
            } else if (response.data.organic_results && Array.isArray(response.data.organic_results)) {
                results = response.data.organic_results;
            } else if (response.data.properties && Array.isArray(response.data.properties)) {
                results = response.data.properties;
            } else {
                // Log the full structure to debug
                console.log('AirbnbService: Unexpected response structure:', JSON.stringify(response.data, null, 2).substring(0, 1000));
            }

            console.log('AirbnbService: Found', results.length, 'results');

            return results.map((property: any) => ({
                id: property.id,
                name: property.title || property.name,
                description: property.description, // API might return this
                link: property.link || property.url,
                city: criteria.city,
                neighborhood: property.neighborhood || property.address?.neighborhood,
                coordinates: property.gps_lat && property.gps_long ? { lat: property.gps_lat, lng: property.gps_long } : undefined,
                price: property.price?.extracted_total_price || property.price?.extracted_price || 0,
                bedrooms: property.bedrooms || criteria.bedrooms || 1,
                rating: property.rating,
                reviewsCount: property.reviews,
                images: property.images || [],
                safetyScore: 9.0, // Still placeholder as API doesn't provide this
                distanceToEvent: property.extracted_distance || 0,
                workspaceScore: 8.0, // Still placeholder
                amenities: property.amenities || []
            }));

        } catch (error) {
            console.error('Airbnb API Error:', error);
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Airbnb API request failed');
        }
    }

    async createBooking(bookingDetails: BookingDetails): Promise<BookingResult> {
        console.log('AirbnbService: Creating booking (mock)...', bookingDetails);

        // The SearchAPI.io is read-only for search. We mock the booking.
        return {
            bookingId: 'abnb_' + Math.random().toString(36).substr(2, 9),
            status: 'confirmed',
            details: bookingDetails
        };
    }
}
