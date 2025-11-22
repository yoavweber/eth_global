import { LLMProvider } from '../../interfaces/LLMProvider.js';
import { SafetyEvaluation, Listing } from '../../schemas/bookingSchemas.js';

export class SafetyService {
    private llmProvider: LLMProvider;

    constructor(llmProvider: LLMProvider) {
        this.llmProvider = llmProvider;
    }

    /**
     * Checks the safety of a given listing using the LLM.
     * @param listing - The listing object (or partial) to evaluate.
     * @returns A SafetyEvaluation object containing a score (0-100) and a reason.
     */
    async checkSafety(listing: Partial<Listing>): Promise<SafetyEvaluation> {
        if (!listing) {
            throw new Error("Listing context is required for safety check");
        }
        return this.llmProvider.evaluateSafety(listing);
    }
}
