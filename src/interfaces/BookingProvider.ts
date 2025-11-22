import { Listing, SearchCriteria, BookingDetails, BookingResult } from '../schemas/bookingSchemas.js';

export { Listing, SearchCriteria, BookingDetails, BookingResult };

export interface BookingProvider {
    searchListings(criteria: SearchCriteria): Promise<Listing[]>;
    createBooking(bookingDetails: BookingDetails): Promise<BookingResult>;
}
