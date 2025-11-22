import { Router } from 'express';
import { AgentController } from '../controllers/AgentController.js';
import { AppDependencies } from '../container.js';

export function createApiRoutes(dependencies: AppDependencies) {
    const router = Router();
    const controller = new AgentController(dependencies);

    // We need to bind the methods to the controller instance
    router.post('/llm-search', controller.llmSearch.bind(controller));
    router.post('/search', controller.search.bind(controller));
    router.post('/safety', controller.checkSafety.bind(controller));
    router.post('/location-score', controller.checkLocationScore.bind(controller));

    return router;
}
