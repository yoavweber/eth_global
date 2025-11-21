import { BookingProvider, SearchCriteria, Listing } from '../interfaces/BookingProvider.js';

export class HackerHouseBookingService implements BookingProvider {
    async searchListings(criteria: SearchCriteria): Promise<Listing[]> {
        // Mock implementation - in a real scenario this would call an external API
        console.log('Searching listings with criteria:', criteria);

        const mockListings: Listing[] = [
            {
                id: '1',
                name: 'Hacker Haven Downtown',
                city: criteria.city,
                price: 150,
                bedrooms: 3,
                safetyScore: 9.5,
                distanceToEvent: 0.5,
                workspaceScore: 10,
                amenities: ['High-speed Wifi', 'Coworking Space', 'Coffee Machine']
            },
            {
                id: '2',
                name: 'Coder\'s Retreat',
                city: criteria.city,
                price: 120,
                bedrooms: 2,
                safetyScore: 8.8,
                distanceToEvent: 2.0,
                workspaceScore: 9,
                amenities: ['Wifi', 'Desk', 'Monitor']
            },
            {
                id: '3',
                name: 'Budget Dev Dorm',
                city: criteria.city,
                price: 80,
                bedrooms: 4,
                safetyScore: 7.5,
                distanceToEvent: 5.0,
                workspaceScore: 7,
                amenities: ['Wifi', 'Shared Workspace']
            }
        ];

        // Simple filtering based on criteria (mock logic)
        return mockListings.filter(listing => {
            if (criteria.bedrooms && listing.bedrooms < criteria.bedrooms) return false;
            return true;
        });
    }

    async createBooking(bookingDetails: any): Promise<any> {
        console.log('Creating booking with details:', bookingDetails);
        return {
            bookingId: 'mock-booking-id-' + Date.now(),
            status: 'confirmed',
            ...bookingDetails
        };
    }
}
