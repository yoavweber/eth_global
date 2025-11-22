import { Request, Response } from 'express';

import { AppDependencies } from '../container.js';
import { SearchCriteriaSchema } from '../schemas/bookingSchemas.js';
import { SearchListingsUseCase, HttpError } from '../usecases/SearchListingsUseCase.js';

export class AgentController {
    private bookingService: AppDependencies['bookingService'];
    private llmService: AppDependencies['llmService'];
    private safetyService: AppDependencies['safetyService'];
    private searchUseCase: SearchListingsUseCase;

    constructor(dependencies: AppDependencies) {
        this.bookingService = dependencies.bookingService;
        this.llmService = dependencies.llmService;
        this.safetyService = dependencies.safetyService;
        this.searchUseCase = new SearchListingsUseCase({
            bookingService: this.bookingService,
            llmService: this.llmService
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
    async checkSafety(req: Request, res: Response) {
        try {
            const { listing } = req.body;
            if (!listing) {
                return res.status(400).json({ error: "Listing context is required" });
            }

            const evaluation = await this.safetyService.checkSafety(listing);
            res.json(evaluation);
        } catch (error) {
            console.error('Safety check error:', error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }

    /**
     * @swagger
     * /api/llm-search:
     *   post:
     *     summary: Search for listings from a natural language request
     *     description: Uses the LLM to parse a natural language request into structured search criteria, then queries listings.
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
     *     responses:
     *       200:
     *         description: Listings derived from LLM-parsed requirements
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 derivedCriteria:
     *                   $ref: '#/components/schemas/SearchCriteria'
     *                 listings:
     *                   type: array
     *                   items:
     *                     $ref: '#/components/schemas/Listing'
     *       400:
     *         description: Invalid input or unable to derive search parameters
     *       500:
     *         description: Internal server error
     */
    async llmSearch(req: Request, res: Response) {
        try {
            const { message } = req.body;
            if (!message) {
                return res.status(400).json({ error: "Message is required" });
            }

            const { derivedCriteria, listings } = await this.searchUseCase.searchFromMessage(message);

            res.json({
                message: "Listings found",
                derivedCriteria,
                count: listings.length,
                listings
            });
        } catch (error) {
            console.error(error);
            if (error instanceof HttpError) {
                return res.status(error.statusCode).json({ error: error.message, details: error.details });
            }
            if (error instanceof Error && error.name === 'ZodError') {
                return res.status(400).json({ error: error.message });
            }
            res.status(500).json({ error: "Internal Server Error" });
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
    async search(req: Request, res: Response) {
        try {
            // Validate request body using Zod
            const criteria = SearchCriteriaSchema.parse(req.body);

            // Validate required backend fields as per "Developer Prompt" logic
            // Zod handles type validation, but specific business logic checks:
            if (!criteria.city || !criteria.checkInDate || !criteria.checkOutDate || !criteria.bedrooms) {
                return res.status(400).json({ error: "Missing required backend fields: city, dates, bedrooms" });
            }

            const { listings } = await this.searchUseCase.searchFromCriteria(criteria);

            res.json({
                message: "Listings found",
                count: listings.length,
                listings: listings
            });

        } catch (error) {
            console.error(error);
            if (error instanceof HttpError) {
                return res.status(error.statusCode).json({ error: error.message, details: error.details });
            }
            if (error instanceof Error && error.name === 'ZodError') {
                return res.status(400).json({ error: error.message });
            }
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
}
