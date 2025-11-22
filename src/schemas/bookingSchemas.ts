import { z } from 'zod';
import { extendZodWithOpenApi, OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export const registry = new OpenAPIRegistry();

export const CoordinatesSchema = z.object({
    lat: z.number().openapi({ example: 38.7223 }),
    lng: z.number().openapi({ example: -9.1393 })
}).openapi('Coordinates');

export const EventLocationSchema = z.object({
    name: z.string().openapi({ example: 'Lisbon Web Summit' }),
    coordinates: CoordinatesSchema
}).openapi('EventLocation');

export const CoworkingSpaceSchema = z.object({
    name: z.string().openapi({ example: 'Second Home Lisboa' }),
    coordinates: CoordinatesSchema,
    description: z.string().optional().openapi({ example: 'Hip coworking space with strong wifi' })
}).openapi('CoworkingSpace');

export const ProximitySchema = z.object({
    description: z.string().openapi({ example: '10 minute walk to the venue' }),
    distanceKm: z.number().optional().openapi({ example: 0.8 })
}).openapi('Proximity');

export const CoworkingProximitySchema = ProximitySchema.extend({
    name: z.string().optional().openapi({ example: 'Second Home Lisboa' })
}).openapi('CoworkingProximity');

export const ListingInsightsSchema = z.object({
    listingId: z.string().openapi({ example: '1' }),
    areaSafety: z.string().openapi({ example: 'Very safe, well-lit streets, tourist-heavy' }),
    eventProximity: ProximitySchema,
    coworkingProximity: CoworkingProximitySchema,
    caveats: z.string().optional().openapi({ example: 'Noise at night due to bars nearby' })
}).openapi('ListingInsights');

export const ListingSchema = z.object({
    id: z.string().openapi({ example: '1' }),
    name: z.string().openapi({ example: 'Hacker Haven' }),
    description: z.string().optional().openapi({ example: 'A great place for hackers' }),
    link: z.string().optional().openapi({ example: 'https://airbnb.com/rooms/1' }),
    city: z.string().openapi({ example: 'San Francisco' }),
    neighborhood: z.string().optional().openapi({ example: 'Alfama' }),
    coordinates: CoordinatesSchema.optional(),
    price: z.number().openapi({ example: 150 }),
    bedrooms: z.number().openapi({ example: 3 }),
    rating: z.number().optional().openapi({ example: 4.8 }),
    reviewsCount: z.number().int().optional().openapi({ example: 120 }),
    images: z.array(z.string()).optional().openapi({ example: ['https://example.com/image.jpg'] }),
    safetyScore: z.number().openapi({ example: 9.5 }),
    distanceToEvent: z.number().openapi({ example: 0.5 }),
    workspaceScore: z.number().openapi({ example: 10 }),
    amenities: z.array(z.string()).openapi({ example: ['Wifi', 'Coffee'] }),
    insights: ListingInsightsSchema.optional()
}).openapi('Listing');

export const SearchCriteriaSchema = z.object({
    city: z.string().openapi({ example: 'San Francisco' }),
    checkInDate: z.string().date().openapi({ example: '2023-10-01' }),
    checkOutDate: z.string().date().openapi({ example: '2023-10-07' }),
    bedrooms: z.number().int().openapi({ example: 3 }),
    events: z.array(z.object({
        name: z.string(),
        coordinates: z.object({
            lat: z.number(),
            lng: z.number()
        })
    })).optional(),
    filters: z.object({
        minPrice: z.number().optional(),
        maxPrice: z.number().optional(),
        minSafetyScore: z.number().optional(),
        minWorkspaceScore: z.number().optional()
    }).optional()
}).openapi('SearchCriteria');

export const BookingDetailsSchema = z.object({
    listingId: z.string().openapi({ example: '1' }),
    startDate: z.string().date().openapi({ example: '2023-10-01' }),
    endDate: z.string().date().openapi({ example: '2023-10-07' }),
    nights: z.number().int().openapi({ example: 6 }),
    payers: z.array(z.string()).openapi({ example: ['Alice', 'Bob'] }),
    bps: z.array(z.number()).openapi({ example: [5000, 5000] })
}).openapi('BookingDetails');

export const BookingResultSchema = z.object({
    bookingId: z.string().openapi({ example: 'bk_12345' }),
    status: z.enum(['confirmed', 'pending', 'failed']).openapi({ example: 'confirmed' }),
    details: BookingDetailsSchema
}).openapi('BookingResult');

export const ListingResponseSchema = z.object({
    message: z.string(),
    count: z.number().int(),
    listings: z.array(ListingSchema)
}).openapi('ListingResponse');

export const TravelRequirementsSchema = z.object({
    destination: z.object({
        city: z.string().optional(),
        country: z.string().optional(),
        region: z.string().optional(),
        rawText: z.string()
    }).openapi({ example: { city: 'Lisbon', country: 'Portugal', rawText: 'Portugal or Spain' } }),
    dates: z.object({
        startDate: z.string().date().optional(),
        endDate: z.string().date().optional(),
        roughWindow: z.string().optional(),
        durationDays: z.number().optional(),
        isFlexible: z.boolean()
    }).openapi({ example: { roughWindow: 'mid-May', isFlexible: true } }),
    travelers: z.object({
        count: z.number().int().optional(),
        roomPreferences: z.string().optional()
    }).openapi({ example: { count: 12, roomPreferences: 'single rooms' } }),
    budget: z.object({
        amount: z.number().optional(),
        currency: z.string().optional(),
        perPerson: z.boolean().optional()
    }).optional().openapi({ example: { amount: 150, currency: 'USD', perPerson: true } }),
    workspace: z.object({
        needs: z.array(z.string()),
        wifi: z.boolean().optional(),
        coworking: z.boolean().optional()
    }).openapi({ example: { needs: ['strong wifi'], wifi: true } }),
    vibe: z.array(z.string()).openapi({ example: ['beach', 'chill'] }),
    constraints: z.array(z.object({
        description: z.string(),
        type: z.enum(['HARD', 'SOFT', 'COMMONSENSE'])
    })).openapi({ example: [{ description: 'Must have strong wifi', type: 'HARD' }] })
}).openapi('TravelRequirements');

registry.register('Listing', ListingSchema);
registry.register('SearchCriteria', SearchCriteriaSchema);
registry.register('BookingDetails', BookingDetailsSchema);
registry.register('BookingResult', BookingResultSchema);
registry.register('ListingResponse', ListingResponseSchema);
registry.register('TravelRequirements', TravelRequirementsSchema);
registry.register('Coordinates', CoordinatesSchema);
registry.register('EventLocation', EventLocationSchema);
registry.register('CoworkingSpace', CoworkingSpaceSchema);
registry.register('Proximity', ProximitySchema);
registry.register('CoworkingProximity', CoworkingProximitySchema);
export const SafetyEvaluationSchema = z.object({
    safety_score: z.number().int().min(0).max(100).openapi({ example: 85 }),
    reason: z.string().openapi({ example: 'Safe residential area with good lighting and nearby amenities.' })
}).openapi('SafetyEvaluation');

export const LocationScoreSchema = z.object({
    proximity_score: z.number().int().min(0).max(100).openapi({ example: 76 }),
    reason: z.string().openapi({ example: 'The location is within a reasonable 18-minute walk and only 9 minutes by transit, making it moderately close and convenient.' })
}).openapi('LocationScore');

export const LocationScoreRequestSchema = z.object({
    housing_coords: CoordinatesSchema,
    target_coords: CoordinatesSchema
}).openapi('LocationScoreRequest');

registry.register('ListingInsights', ListingInsightsSchema);
registry.register('SafetyEvaluation', SafetyEvaluationSchema);
registry.register('LocationScore', LocationScoreSchema);
registry.register('LocationScoreRequest', LocationScoreRequestSchema);

export function getOpenApiComponents() {
    const generator = new OpenApiGeneratorV3(registry.definitions);
    const doc = generator.generateComponents();
    return doc.components;
}

export type Listing = z.infer<typeof ListingSchema>;
export type SearchCriteria = z.infer<typeof SearchCriteriaSchema>;
export type BookingDetails = z.infer<typeof BookingDetailsSchema>;
export type BookingResult = z.infer<typeof BookingResultSchema>;
export type ListingResponse = z.infer<typeof ListingResponseSchema>;
export type TravelRequirements = z.infer<typeof TravelRequirementsSchema>;
export type Coordinates = z.infer<typeof CoordinatesSchema>;
export type EventLocation = z.infer<typeof EventLocationSchema>;
export type CoworkingSpace = z.infer<typeof CoworkingSpaceSchema>;
export type ListingInsights = z.infer<typeof ListingInsightsSchema>;
export type SafetyEvaluation = z.infer<typeof SafetyEvaluationSchema>;
export type LocationScore = z.infer<typeof LocationScoreSchema>;
export type LocationScoreRequest = z.infer<typeof LocationScoreRequestSchema>;
