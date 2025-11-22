import { TravelRequirements, Listing, EventLocation, CoworkingSpace, ListingInsights } from '../schemas/bookingSchemas.js';

export interface LLMProvider {
    parseRequirements(message: string): Promise<TravelRequirements>;
    analyzeListings(
        listings: Listing[],
        context: {
            event: EventLocation;
            coworkingSpaces: CoworkingSpace[];
        }
    ): Promise<ListingInsights[]>;


    evaluateSafety(listing: Partial<Listing>): Promise<import('../schemas/bookingSchemas.js').SafetyEvaluation>;
}
