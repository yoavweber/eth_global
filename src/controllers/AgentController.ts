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
     *   post:
     *     summary: Check safety of a listing/location
     *     description: Uses LLM to evaluate safety based on listing context.
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               listing:
     *                 $ref: '#/components/schemas/Listing'
     *     responses:
     *       200:
     *         description: Safety evaluation result
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/SafetyEvaluation'
     *       400:
     *         description: Missing listing context
     *       500:
     *         description: Internal server error
     */
    async checkSafety(req: Request<{}, SafetyResponse | ErrorResponse, SafetyRequest>, res: Response<SafetyResponse | ErrorResponse>): Promise<void> {
        try {
            const requestBody = SafetyRequestSchema.parse(req.body);
            const { listing } = requestBody;

            const evaluation: SafetyResponse = await this.safetyService.checkSafety(listing);
            res.json(evaluation);
        } catch (error) {
            console.error('Safety check error:', error);
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
     *   post:
     *     summary: Evaluate proximity score between housing and target location
     *     description: Uses OpenRouteService for walking metrics and LLM for scoring.
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/LocationScoreRequest'
     *     responses:
     *       200:
     *         description: Location score result
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/LocationScore'
     *       400:
     *         description: Missing coordinates
     *       500:
     *         description: Internal server error
     */
    async checkLocationScore(req: Request<{}, LocationScoreResponse | ErrorResponse, LocationScoreRequest>, res: Response<LocationScoreResponse | ErrorResponse>): Promise<void> {
        try {
            const requestBody = LocationScoreRequestSchema.parse(req.body);
            const { housing_coords, target_coords } = requestBody;

            const score: LocationScoreResponse = await this.locationScoreService.checkLocationScore(housing_coords, target_coords);
            res.json(score);
        } catch (error) {
            console.error('Location score check error:', error);
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
     *   post:
     *     summary: Search for listings from a natural language request
     *     description: End-to-end flow:
     *       - Uses the LLM to parse a natural language request into structured search criteria.
     *       - Searches potential listings.
     *       - Mocks coworking proximity per listing.
     *       - Evaluates safety of each listing.
     *       - Optionally evaluates distance to an event if provided.
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               message:
     *                 type: string
     *                 example: "We’re 6 people, need Lisbon in early May, budget $200 per night"
     *               event:
     *                 $ref: '#/components/schemas/EventLocation'
     *                 description: Optional event location used for proximity scoring.
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
    async llmSearch(req: Request<{}, LLMSearchResponse | ErrorResponse, LLMSearchRequest>, res: Response<LLMSearchResponse | ErrorResponse>): Promise<void> {
        try {
            const requestBody = LLMSearchRequestSchema.parse(req.body);
            const { message, event } = requestBody;

            const { derivedCriteria, overallRating, results } =
                await this.searchUseCase.searchFromMessage(message, { event });

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
     *   post:
     *     summary: Search for listings
     *     description: Search for hacker house listings based on criteria.
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/SearchCriteria'
     *     responses:
     *       200:
     *         description: List of matching listings
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ListingResponse'
     *       400:
     *         description: Missing required fields
     *       500:
     *         description: Internal server error
     */
    async search(req: Request<{}, SearchResponse | ErrorResponse, SearchCriteria>, res: Response<SearchResponse | ErrorResponse>): Promise<void> {
        try {
            // Validate request body using Zod
            const criteria: SearchCriteria = SearchCriteriaSchema.parse(req.body);

            // Validate required backend fields as per "Developer Prompt" logic
            // Zod handles type validation, but specific business logic checks:
            if (!criteria.city || !criteria.checkInDate || !criteria.checkOutDate || !criteria.bedrooms) {
                const errorResponse: ErrorResponse = { error: "Missing required backend fields: city, dates, bedrooms" };
                res.status(400).json(errorResponse);
                return;
            }

            const { listings } = await this.searchUseCase.searchFromCriteria(criteria);

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
