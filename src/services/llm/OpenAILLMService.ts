import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';
import { LLMProvider } from '../../interfaces/LLMProvider.js';
import { TravelRequirements, Listing, EventLocation, CoworkingSpace, ListingInsightsSchema, ListingInsights, SafetyEvaluation, SafetyEvaluationSchema } from '../../schemas/bookingSchemas.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class OpenAILLMService implements LLMProvider {
    private openai: OpenAI;
    private systemPrompt: string;
    private developerPrompt: string;
    private safetyPrompt: string;

    constructor() {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!process.env.OPENAI_API_KEY) {
            console.warn('OPENAI_API_KEY is not set. OpenAILLMService will fail if used.');
        }
        this.openai = new OpenAI({ apiKey: apiKey });

        // Load prompts
        try {
            const promptsDir = path.join(process.cwd(), 'src/prompts');
            this.systemPrompt = fs.readFileSync(path.join(promptsDir, 'systemPrompt.md'), 'utf-8');
            this.developerPrompt = fs.readFileSync(path.join(promptsDir, 'developerPrompt.md'), 'utf-8');
            this.safetyPrompt = fs.readFileSync(path.join(promptsDir, 'safetyPrompt.md'), 'utf-8');
        } catch (error) {
            console.error('Failed to load prompts:', error);
            this.systemPrompt = "You are a helpful assistant.";
            this.developerPrompt = "";
            this.safetyPrompt = "";
        }
    }

    async parseRequirements(message: string): Promise<TravelRequirements> {
        console.log('OpenAILLMService: Parsing requirements...');

        try {
            // Dynamically inject current date into system prompt
            const now = new Date();
            const formattedDate = now.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }); // Format: "November 22, 2025"

            const currentYear = now.getFullYear();
            const currentMonth = now.getMonth(); // 0-indexed (0 = January, 11 = December)
            const nextYear = currentYear + 1;

            // Generate dynamic examples based on current date
            // Example: If current month is November (10), a past month like May (4) should use next year
            const pastMonthExample = currentMonth >= 4 ? 'May' : 'January';
            const pastMonthYear = currentMonth >= 4 ? nextYear : currentYear;
            const futureMonthExample = currentMonth < 11 ? 'December' : 'February';
            const futureMonthYear = currentMonth < 11 ? currentYear : nextYear;

            let systemPromptWithDate = this.systemPrompt
                .replace(/{{CURRENT_DATE}}/g, formattedDate)
                .replace(/{{CURRENT_YEAR}}/g, currentYear.toString())
                .replace(/{{NEXT_YEAR}}/g, nextYear.toString())
                .replace(/{{PAST_MONTH_EXAMPLE}}/g, pastMonthExample)
                .replace(/{{PAST_MONTH_YEAR}}/g, pastMonthYear.toString())
                .replace(/{{FUTURE_MONTH_EXAMPLE}}/g, futureMonthExample)
                .replace(/{{FUTURE_MONTH_YEAR}}/g, futureMonthYear.toString());

            const messages = [
                { role: "system" as const, content: systemPromptWithDate },
                { role: "user" as const, content: this.developerPrompt.replace('{{USER_MESSAGE}}', message) }
            ];
            console.log('OpenAILLMService: Sending messages to OpenAI:', JSON.stringify(messages, null, 2));

            const completion = await this.openai.chat.completions.create({
                model: "gpt-4o", // or gpt-3.5-turbo-0125
                messages: messages,
                response_format: { type: "json_object" }
            });

            const content = completion.choices[0].message.content;
            if (!content) {
                throw new Error("OpenAI returned empty content");
            }

            const parsed = JSON.parse(content);
            // In a production app, we should validate 'parsed' against TravelRequirementsSchema here using Zod
            return parsed as TravelRequirements;

        } catch (error) {
            console.error('OpenAI API Error:', error);
            throw error;
        }
    }

    async analyzeListings(
        listings: Listing[],
        context: { event: EventLocation; coworkingSpaces: CoworkingSpace[]; }
    ): Promise<ListingInsights[]> {
        console.log('OpenAILLMService: Analyzing listings for safety and proximity...');

        const sanitizedListings = listings.map(listing => {
            // Strip any previous insights before sending to the model
            const { insights, ...rest } = listing;
            return rest;
        });

        const messages = [
            {
                role: "system" as const,
                content: [
                    "You are a booking analyst. Given listings, one event, and coworking spaces, return JSON with concise insights.",
                    "For each listing, produce:",
                    "- listingId",
                    "- areaSafety: one short sentence using only provided data (no hallucinations).",
                    "- eventProximity: description (walk/drive) and distanceKm if coordinates exist.",
                    "- coworkingProximity: nearest coworking with name, description, and distanceKm if coordinates exist.",
                    "- caveats: optional short warning (noise, hills, transit gaps).",
                    "Rules:",
                    "- Use only provided fields (city, neighborhood, coordinates, safetyScore, distanceToEvent).",
                    "- If coordinates are 0/0 or missing, treat distance as unknown and omit distanceKm.",
                    "- If coordinates are missing, base proximity on city/neighborhood and say 'distance unknown'.",
                    "- Keep sentences tight and factual. No markdown or prose outside JSON.",
                    "Return JSON object { \"insights\": ListingInsights[] } matching the schema."
                ].join('\n')
            },
            {
                role: "user" as const,
                content: JSON.stringify({
                    event: context.event,
                    coworkingSpaces: context.coworkingSpaces,
                    listings: sanitizedListings
                }, null, 2)
            }
        ];

        try {
            const completion = await this.openai.chat.completions.create({
                model: "gpt-4o",
                messages,
                response_format: { type: "json_object" }
            });

            const content = completion.choices[0].message.content;
            if (!content) {
                throw new Error("OpenAI returned empty content for listing analysis");
            }

            const parsed = JSON.parse(content);
            const candidate = Array.isArray(parsed) ? parsed : parsed.insights ?? parsed;
            const validation = z.array(ListingInsightsSchema).safeParse(candidate);

            if (!validation.success) {
                console.error('LLM analyzeListings returned invalid shape', validation.error.flatten());
                throw new Error('LLM analysis response failed validation');
            }

            return validation.data;
        } catch (error) {
            console.error('OpenAI analysis Error:', error);
            throw error;
        }
    }

    async evaluateSafety(listing: Partial<Listing>): Promise<SafetyEvaluation> {
        console.log(`OpenAILLMService: Evaluating safety for listing: ${listing.id || 'unknown'} in ${listing.city}`);

        const messages = [
            {
                role: "system" as const,
                content: this.safetyPrompt
            },
            {
                role: "user" as const,
                content: JSON.stringify(listing, null, 2)
            }
        ];

        try {
            const completion = await this.openai.chat.completions.create({
                model: "gpt-4o",
                messages,
                response_format: { type: "json_object" }
            });

            const content = completion.choices[0].message.content;
            if (!content) {
                throw new Error("OpenAI returned empty content for safety evaluation");
            }

            const parsed = JSON.parse(content);
            const validation = SafetyEvaluationSchema.safeParse(parsed);

            if (!validation.success) {
                console.error('LLM evaluateSafety returned invalid shape', validation.error.flatten());
                throw new Error('LLM safety evaluation response failed validation');
            }

            return validation.data;
        } catch (error) {
            console.error('OpenAI safety evaluation Error:', error);
            throw error;
        }
    }

}
