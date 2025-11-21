import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { HackerHouseBookingService } from '../services/HackerHouseBookingService.js';
import { SearchCriteria } from '../interfaces/BookingProvider.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const bookingService = new HackerHouseBookingService();

const getPromptContent = (filename: string) => {
    const promptPath = path.join(__dirname, '../prompts', filename);
    return fs.readFileSync(promptPath, 'utf-8');
};

/**
 * @swagger
 * components:
 *   schemas:
 *     SearchCriteria:
 *       type: object
 *       required:
 *         - city
 *         - checkInDate
 *         - checkOutDate
 *         - bedrooms
 *       properties:
 *         city:
 *           type: string
 *           description: The city to search in
 *         checkInDate:
 *           type: string
 *           format: date
 *           description: Check-in date (YYYY-MM-DD)
 *         checkOutDate:
 *           type: string
 *           format: date
 *           description: Check-out date (YYYY-MM-DD)
 *         bedrooms:
 *           type: integer
 *           description: Number of bedrooms required
 *         events:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               coordinates:
 *                 type: object
 *                 properties:
 *                   lat:
 *                     type: number
 *                   lng:
 *                     type: number
 *         filters:
 *           type: object
 *           properties:
 *             minPrice:
 *               type: number
 *             maxPrice:
 *               type: number
 *             minSafetyScore:
 *               type: number
 *             minWorkspaceScore:
 *               type: number
 *     Listing:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         city:
 *           type: string
 *         price:
 *           type: number
 *         bedrooms:
 *           type: integer
 *         safetyScore:
 *           type: number
 *         distanceToEvent:
 *           type: number
 *         workspaceScore:
 *           type: number
 *         amenities:
 *           type: array
 *           items:
 *             type: string
 */
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
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                 count:
     *                   type: integer
     *                 listings:
     *                   type: array
     *                   items:
     *                     $ref: '#/components/schemas/Listing'
     *       400:
     *         description: Missing required fields
     *       500:
     *         description: Internal server error
     */
    static async search(req: Request, res: Response) {
        try {
            // In a real LLM app, we would feed the prompts and user input to the LLM here.
            // For this demo, we expect structured criteria or we'd parse it.
            // We'll assume the body contains the criteria for now to demonstrate the service connection.

            const criteria: SearchCriteria = req.body;

            // Validate required backend fields as per "Developer Prompt"
            if (!criteria.city || !criteria.checkInDate || !criteria.checkOutDate || !criteria.bedrooms) {
                return res.status(400).json({ error: "Missing required backend fields: city, dates, bedrooms" });
            }

            const listings = await bookingService.searchListings(criteria);

            // Sort listings based on the "Developer Prompt" logic
            // sort_by(safety_score DESC, min_distance_to_events ASC, bedrooms >= required DESC, price ASC, workspace_score DESC)
            listings.sort((a, b) => {
                if (b.safetyScore !== a.safetyScore) return b.safetyScore - a.safetyScore;
                if (a.distanceToEvent !== b.distanceToEvent) return a.distanceToEvent - b.distanceToEvent;
                // bedrooms logic is a bit complex in sort, assuming we just want more bedrooms? 
                // The prompt says "bedrooms >= required DESC", which implies satisfying the req is binary, but then sorting?
                // Let's just sort by bedrooms DESC for simplicity
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
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
}
