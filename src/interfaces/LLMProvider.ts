import { TravelRequirements } from '../schemas/bookingSchemas.js';

export interface LLMProvider {
    parseRequirements(message: string): Promise<TravelRequirements>;
}
