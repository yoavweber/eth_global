import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';

import { HackerHouseBookingService } from '../services/HackerHouseBookingService.js';
import { SearchCriteriaSchema, BookingDetailsSchema, ListingSchema, BookingResultSchema } from '../schemas/bookingSchemas.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const bookingService = new HackerHouseBookingService();

const getPromptContent = (filename: string) => {
    const promptPath = path.join(__dirname, '../prompts', filename);
    return fs.readFileSync(promptPath, 'utf-8');
};

export class AgentController {
    /**
     * @swagger
     * /api/prompts:
     *   get:
     *     summary: Get the agent prompts
     *     description: Returns the System, Developer, and Assistant prompts used by the agent.
     *     responses:
     *       200:
     *         description: The prompts
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 system:
     *                   type: string
     *                 developer:
     *                   type: string
     *                 assistant:
     *                   type: string
     */
    static getPrompts(req: Request, res: Response) {
        try {
            const systemPrompt = getPromptContent('systemPrompt.md');
            const developerPrompt = getPromptContent('developerPrompt.md');
            const assistantPrompt = getPromptContent('assistantPrompt.md');

            res.json({
                system: systemPrompt,
                developer: developerPrompt,
                assistant: assistantPrompt
            });
        } catch (error) {
            console.error('Error reading prompts:', error);
            res.status(500).json({ error: "Failed to load prompts" });
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
    static async search(req: Request, res: Response) {
        try {
            // Validate request body using Zod
            const criteria = SearchCriteriaSchema.parse(req.body);

            // Validate required backend fields as per "Developer Prompt" logic
            // Zod handles type validation, but specific business logic checks:
            if (!criteria.city || !criteria.checkInDate || !criteria.checkOutDate || !criteria.bedrooms) {
                return res.status(400).json({ error: "Missing required backend fields: city, dates, bedrooms" });
            }

            const listings = await bookingService.searchListings(criteria);

            // Sort listings based on the "Developer Prompt" logic
            listings.sort((a, b) => {
                if (b.safetyScore !== a.safetyScore) return b.safetyScore - a.safetyScore;
                if (a.distanceToEvent !== b.distanceToEvent) return a.distanceToEvent - b.distanceToEvent;
                if (b.bedrooms !== a.bedrooms) return b.bedrooms - a.bedrooms;
                if (a.price !== b.price) return a.price - b.price;
                return b.workspaceScore - a.workspaceScore;
            });

            res.json({
                message: "Listings found",
                count: listings.length,
                listings: listings
            });

        } catch (error) {
            console.error(error);
            if (error instanceof Error && error.name === 'ZodError') {
                return res.status(400).json({ error: error.message });
            }
            res.status(500).json({ error: "Internal Server Error" });
        }
    }

    /**
     * @swagger
     * /api/booking:
     *   post:
     *     summary: Create a new booking
     *     description: Create a booking for a listing.
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/BookingDetails'
     *     responses:
     *       200:
     *         description: Booking created successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/BookingResult'
     *       500:
     *         description: Internal server error
     */
    static async createBooking(req: Request, res: Response) {
        try {
            // Validate request body using Zod
            const bookingDetails = BookingDetailsSchema.parse(req.body);

            const result = await bookingService.createBooking(bookingDetails);
            res.json(result);
        } catch (error) {
            console.error(error);
            if (error instanceof Error && error.name === 'ZodError') {
                return res.status(400).json({ error: error.message });
            }
            res.status(500).json({ error: "Internal Server Error" });
        }
    }


}
