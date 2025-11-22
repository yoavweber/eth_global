import { BookingProvider } from './interfaces/BookingProvider.js';
import { LLMProvider } from './interfaces/LLMProvider.js';
import { OpenAILLMService } from './services/llm/OpenAILLMService.js';
import { AirbnbService } from './services/booking/AirbnbService.js';

import { SafetyService } from './services/safety/SafetyService.js';
import { LocationScoreService } from './services/location/LocationScoreService.js';
 
export interface AppDependencies {
    bookingService: BookingProvider;
    llmService: LLMProvider;
    safetyService: SafetyService;
    locationScoreService: LocationScoreService;
}

export function createContainer(): AppDependencies {
    // Here we can add logic to switch implementations based on env vars

    const bookingService = new AirbnbService();
    // const bookingService = new BookingDotComService();

    const llmService = new OpenAILLMService();
    const safetyService = new SafetyService(llmService);
    const locationScoreService = new LocationScoreService();

    return {
        bookingService,
        llmService,
        safetyService,
        locationScoreService
    };
}
