import { Request, Response } from 'express';

import { AppDependencies } from '../container.js';
import {
    SearchCriteriaSchema,
    SafetyRequestSchema,
    LocationScoreRequestSchema,
    LLMSearchRequestSchema,
    SafetyRequest,
    SafetyResponse,
    LocationScoreRequest,
    LocationScoreResponse,
    LLMSearchRequest,
    LLMSearchResponse,
    SearchRequest,
    SearchCriteria,
    SearchResponse,
    ErrorResponse
} from '../schemas/bookingSchemas.js';
import { SearchListingsUseCase, HttpError } from '../usecases/SearchListingsUseCase.js';

export class AgentController {
    private bookingService: AppDependencies['bookingService'];
    private llmService: AppDependencies['llmService'];
    private safetyService: AppDependencies['safetyService'];
    private locationScoreService: AppDependencies['locationScoreService'];
    private searchUseCase: SearchListingsUseCase;

    constructor(dependencies: AppDependencies) {
        this.bookingService = dependencies.bookingService;
        this.llmService = dependencies.llmService;
        this.safetyService = dependencies.safetyService;
        this.locationScoreService = dependencies.locationScoreService;
        this.searchUseCase = new SearchListingsUseCase({
            bookingService: this.bookingService,
            llmService: this.llmService,
            anchors: {
                events: {},
                coworking: {}
            }
        });
    }

    /**
     * @swagger
     * /api/safety:
     *   get:
     *     summary: Check safety of a listing/location
     *     description: Uses LLM to evaluate safety based on listing context.
     *     parameters:
     *       - in: query
     *         name: listing
     *         required: true
     *         schema:
     *           type: string
     *         description: JSON string representation of the listing object
     *     responses:
     *       200:
     *         description: Safety evaluation result
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/SafetyEvaluation'
     *       400:
     *         description: Missing listing context or invalid JSON
     *       500:
     *         description: Internal server error
     */
    async checkSafety(req: Request<{}, SafetyResponse | ErrorResponse, {}, { listing: string }>, res: Response<SafetyResponse | ErrorResponse>): Promise<void> {
        try {
            const { listing: listingStr } = req.query;
            
            if (!listingStr || typeof listingStr !== 'string') {
                const errorResponse: ErrorResponse = { error: "Missing or invalid 'listing' query parameter. Expected JSON string." };
                res.status(400).json(errorResponse);
                return;
            }

            const listing = JSON.parse(listingStr);
            const requestBody = SafetyRequestSchema.parse({ listing });

            const evaluation: SafetyResponse = await this.safetyService.checkSafety(requestBody.listing);
            res.json(evaluation);
        } catch (error) {
            console.error('Safety check error:', error);
            if (error instanceof SyntaxError) {
                const errorResponse: ErrorResponse = { error: "Invalid JSON in 'listing' query parameter" };
                res.status(400).json(errorResponse);
                return;
            }
            if (error instanceof Error && error.name === 'ZodError') {
                const errorResponse: ErrorResponse = { error: error.message };
                res.status(400).json(errorResponse);
                return;
            }
            const errorResponse: ErrorResponse = { error: "Internal Server Error" };
            res.status(500).json(errorResponse);
        }
    }

    /**
     * @swagger
     * /api/location-score:
     *   get:
     *     summary: Evaluate proximity score between housing and target location
     *     description: Uses OpenRouteService for walking metrics and LLM for scoring.
     *     parameters:
     *       - in: query
     *         name: housing_coords
     *         required: true
     *         schema:
     *           type: string
     *         description: JSON string representation of housing coordinates {lat, lng}
     *       - in: query
     *         name: target_coords
     *         required: true
     *         schema:
     *           type: string
     *         description: JSON string representation of target coordinates {lat, lng}
     *     responses:
     *       200:
     *         description: Location score result
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/LocationScore'
     *       400:
     *         description: Missing coordinates or invalid JSON
     *       500:
     *         description: Internal server error
     */
    async checkLocationScore(req: Request<{}, LocationScoreResponse | ErrorResponse, {}, { housing_coords: string; target_coords: string }>, res: Response<LocationScoreResponse | ErrorResponse>): Promise<void> {
        try {
            const { housing_coords: housingCoordsStr, target_coords: targetCoordsStr } = req.query;
            
            if (!housingCoordsStr || typeof housingCoordsStr !== 'string') {
                const errorResponse: ErrorResponse = { error: "Missing or invalid 'housing_coords' query parameter. Expected JSON string." };
                res.status(400).json(errorResponse);
                return;
            }
            
            if (!targetCoordsStr || typeof targetCoordsStr !== 'string') {
                const errorResponse: ErrorResponse = { error: "Missing or invalid 'target_coords' query parameter. Expected JSON string." };
                res.status(400).json(errorResponse);
                return;
            }

            const housing_coords = JSON.parse(housingCoordsStr);
            const target_coords = JSON.parse(targetCoordsStr);
            const requestBody = LocationScoreRequestSchema.parse({ housing_coords, target_coords });

            const score: LocationScoreResponse = await this.locationScoreService.checkLocationScore(requestBody.housing_coords, requestBody.target_coords);
            res.json(score);
        } catch (error) {
            console.error('Location score check error:', error);
            if (error instanceof SyntaxError) {
                const errorResponse: ErrorResponse = { error: "Invalid JSON in coordinates query parameters" };
                res.status(400).json(errorResponse);
                return;
            }
            if (error instanceof Error && error.name === 'ZodError') {
                const errorResponse: ErrorResponse = { error: error.message };
                res.status(400).json(errorResponse);
                return;
            }
            const errorResponse: ErrorResponse = { error: "Internal Server Error" };
            res.status(500).json(errorResponse);
        }
    }

    /**
     * @swagger
     * /api/llm-search:
     *   get:
     *     summary: Search for listings from a natural language request
     *     description: End-to-end flow:
     *       - Uses the LLM to parse a natural language request into structured search criteria.
     *       - Searches potential listings.
     *       - Mocks coworking proximity per listing.
     *       - Evaluates safety of each listing.
     *       - Optionally evaluates distance to an event if provided.
     *     parameters:
     *       - in: query
     *         name: message
     *         required: true
     *         schema:
     *           type: string
     *         description: Natural language search request
     *         example: "We're 6 people, need Lisbon in early May, budget $200 per night"
     *       - in: query
     *         name: event
     *         required: false
     *         schema:
     *           type: string
     *         description: Optional JSON string representation of event location used for proximity scoring
     *     responses:
     *       200:
     *         description: Scored listings derived from LLM-parsed requirements
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 derivedCriteria:
     *                   $ref: '#/components/schemas/SearchCriteria'
     *                 overallRating:
     *                   type: number
     *                 results:
     *                   type: array
     *                   items:
     *                     type: object
     *                     properties:
     *                       listing:
     *                         $ref: '#/components/schemas/Listing'
     *                       scores:
     *                         type: object
     *                         properties:
     *                           overall:
     *                             type: number
     *                           safety:
     *                             type: number
     *                           coworkingProximity:
     *                             type: number
     *                           eventProximity:
     *                             type: number
     *                             nullable: true
     *       400:
     *         description: Invalid input or unable to derive search parameters
     *       500:
     *         description: Internal server error
     */
    async llmSearch(req: Request<{}, LLMSearchResponse | ErrorResponse, {}, { message: string; event?: string }>, res: Response<LLMSearchResponse | ErrorResponse>): Promise<void> {
        try {
            const { message, event: eventStr } = req.query;
            
            if (!message || typeof message !== 'string') {
                const errorResponse: ErrorResponse = { error: "Missing or invalid 'message' query parameter" };
                res.status(400).json(errorResponse);
                return;
            }

            let event;
            if (eventStr && typeof eventStr === 'string') {
                event = JSON.parse(eventStr);
            }

            const requestBody = LLMSearchRequestSchema.parse({ message, event });

            const { derivedCriteria, overallRating, results } =
                await this.searchUseCase.searchFromMessage(requestBody.message, { event: requestBody.event });

            const response: LLMSearchResponse = {
                message: "Listings found",
                derivedCriteria,
                overallRating,
                count: results.length,
                results
            };
            res.json(response);
        } catch (error) {
            console.error(error);
            if (error instanceof SyntaxError) {
                const errorResponse: ErrorResponse = { error: "Invalid JSON in 'event' query parameter" };
                res.status(400).json(errorResponse);
                return;
            }
            if (error instanceof HttpError) {
                const errorResponse: ErrorResponse = { error: error.message, details: error.details };
                res.status(error.statusCode).json(errorResponse);
                return;
            }
            if (error instanceof Error && error.name === 'ZodError') {
                const errorResponse: ErrorResponse = { error: error.message };
                res.status(400).json(errorResponse);
                return;
            }
            const errorResponse: ErrorResponse = { error: "Internal Server Error" };
            res.status(500).json(errorResponse);
        }
    }

    /**
     * @swagger
     * /api/search:
     *   get:
     *     summary: Search for listings
     *     description: Search for hacker house listings based on criteria.
     *     parameters:
     *       - in: query
     *         name: city
     *         required: true
     *         schema:
     *           type: string
     *         description: City name
     *       - in: query
     *         name: checkInDate
     *         required: true
     *         schema:
     *           type: string
     *           format: date
     *         description: Check-in date (YYYY-MM-DD)
     *       - in: query
     *         name: checkOutDate
     *         required: true
     *         schema:
     *           type: string
     *           format: date
     *         description: Check-out date (YYYY-MM-DD)
     *       - in: query
     *         name: bedrooms
     *         required: true
     *         schema:
     *           type: integer
     *         description: Number of bedrooms
     *       - in: query
     *         name: events
     *         required: false
     *         schema:
     *           type: string
     *         description: Optional JSON string array of event locations
     *       - in: query
     *         name: filters
     *         required: false
     *         schema:
     *           type: string
     *         description: Optional JSON string of filter criteria (minPrice, maxPrice, minSafetyScore, minWorkspaceScore)
     *     responses:
     *       200:
     *         description: List of matching listings
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ListingResponse'
     *       400:
     *         description: Missing required fields or invalid JSON
     *       500:
     *         description: Internal server error
     */
    async search(req: Request<{}, SearchResponse | ErrorResponse, {}, { city?: string; checkInDate?: string; checkOutDate?: string; bedrooms?: string; events?: string; filters?: string }>, res: Response<SearchResponse | ErrorResponse>): Promise<void> {
        try {
            const { city, checkInDate, checkOutDate, bedrooms, events: eventsStr, filters: filtersStr } = req.query;

            // Build criteria object from query parameters
            const criteria: any = {};
            
            if (city) criteria.city = city;
            if (checkInDate) criteria.checkInDate = checkInDate;
            if (checkOutDate) criteria.checkOutDate = checkOutDate;
            if (bedrooms) criteria.bedrooms = parseInt(bedrooms, 10);
            if (eventsStr) {
                try {
                    criteria.events = JSON.parse(eventsStr);
                } catch (e) {
                    const errorResponse: ErrorResponse = { error: "Invalid JSON in 'events' query parameter" };
                    res.status(400).json(errorResponse);
                    return;
                }
            }
            if (filtersStr) {
                try {
                    criteria.filters = JSON.parse(filtersStr);
                } catch (e) {
                    const errorResponse: ErrorResponse = { error: "Invalid JSON in 'filters' query parameter" };
                    res.status(400).json(errorResponse);
                    return;
                }
            }

            // Validate request using Zod
            const validatedCriteria: SearchCriteria = SearchCriteriaSchema.parse(criteria);

            // Validate required backend fields as per "Developer Prompt" logic
            // Zod handles type validation, but specific business logic checks:
            if (!validatedCriteria.city || !validatedCriteria.checkInDate || !validatedCriteria.checkOutDate || !validatedCriteria.bedrooms) {
                const errorResponse: ErrorResponse = { error: "Missing required backend fields: city, dates, bedrooms" };
                res.status(400).json(errorResponse);
                return;
            }

            const { listings } = await this.searchUseCase.searchFromCriteria(validatedCriteria);

            const response: SearchResponse = {
                message: "Listings found",
                count: listings.length,
                listings: listings
            };
            res.json(response);

        } catch (error) {
            console.error(error);
            if (error instanceof HttpError) {
                const errorResponse: ErrorResponse = { error: error.message, details: error.details };
                res.status(error.statusCode).json(errorResponse);
                return;
            }
            if (error instanceof Error && error.name === 'ZodError') {
                const errorResponse: ErrorResponse = { error: error.message };
                res.status(400).json(errorResponse);
                return;
            }
            const errorResponse: ErrorResponse = { error: "Internal Server Error" };
            res.status(500).json(errorResponse);
        }
    }
}
