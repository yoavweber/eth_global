import { z } from 'zod';
import { extendZodWithOpenApi, OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export const registry = new OpenAPIRegistry();

export const ListingSchema = z.object({
    id: z.string().openapi({ example: '1' }),
    name: z.string().openapi({ example: 'Hacker Haven' }),
    city: z.string().openapi({ example: 'San Francisco' }),
    price: z.number().openapi({ example: 150 }),
    bedrooms: z.number().openapi({ example: 3 }),
    safetyScore: z.number().openapi({ example: 9.5 }),
    distanceToEvent: z.number().openapi({ example: 0.5 }),
    workspaceScore: z.number().openapi({ example: 10 }),
    amenities: z.array(z.string()).openapi({ example: ['Wifi', 'Coffee'] })
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

registry.register('Listing', ListingSchema);
registry.register('SearchCriteria', SearchCriteriaSchema);
registry.register('BookingDetails', BookingDetailsSchema);
registry.register('BookingResult', BookingResultSchema);
registry.register('ListingResponse', ListingResponseSchema);

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
