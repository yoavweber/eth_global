import { BookingProvider } from './interfaces/BookingProvider.js';
import { LLMProvider } from './interfaces/LLMProvider.js';
import { OpenAILLMService } from './services/llm/OpenAILLMService.js';
import { AirbnbService } from './services/booking/AirbnbService.js';

export interface AppDependencies {
    bookingService: BookingProvider;
    llmService: LLMProvider;
}

export function createContainer(): AppDependencies {
    // Here we can add logic to switch implementations based on env vars

    const bookingService = new AirbnbService();
    // const bookingService = new BookingDotComService();
    // const bookingService = new HackerHouseBookingService(); // Mock alternative

    const llmService = new OpenAILLMService();
    // const llmService = new LLMService(); // Mock alternative

    return {
        bookingService,
        llmService
    };
}
