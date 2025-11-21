export interface Listing {
    id: string;
    name: string;
    city: string;
    price: number;
    bedrooms: number;
    safetyScore: number;
    distanceToEvent: number;
    workspaceScore: number;
    amenities: string[];
}

export interface SearchCriteria {
    city: string;
    checkInDate: string;
    checkOutDate: string;
    bedrooms: number;
    events?: { name: string; coordinates: { lat: number; lng: number } }[];
    filters?: {
        minPrice?: number;
        maxPrice?: number;
        minSafetyScore?: number;
        minWorkspaceScore?: number;
    };
}

export interface BookingProvider {
    searchListings(criteria: SearchCriteria): Promise<Listing[]>;
    createBooking(bookingDetails: any): Promise<any>;
}
