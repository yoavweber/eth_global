import { BookingProvider } from './interfaces/BookingProvider.js';
import { LLMProvider } from './interfaces/LLMProvider.js';
import { OpenAILLMService } from './services/llm/OpenAILLMService.js';
import { AirbnbService } from './services/booking/AirbnbService.js';

import { SafetyService } from './services/safety/SafetyService.js';

export interface AppDependencies {
    bookingService: BookingProvider;
    llmService: LLMProvider;
    safetyService: SafetyService;
}

export function createContainer(): AppDependencies {
    // Here we can add logic to switch implementations based on env vars

    const bookingService = new AirbnbService();
    // const bookingService = new BookingDotComService();

    const llmService = new OpenAILLMService();
    const safetyService = new SafetyService(llmService);

    return {
        bookingService,
        llmService,
        safetyService
    };
}
