import { Router } from 'express';
import { AgentController } from '../controllers/AgentController.js';
import { EvvmNameServiceController } from '../controllers/EvvmNameServiceController.js';
import { AppDependencies } from '../container.js';

export function createApiRoutes(dependencies: AppDependencies) {
    const router = Router();
    const agentController = new AgentController(dependencies);
    const evvmController = new EvvmNameServiceController(dependencies);

    // We need to bind the methods to the controller instance
    router.get('/llm-search', agentController.llmSearch.bind(agentController));
    router.get('/search', agentController.search.bind(agentController));
    router.get('/safety', agentController.checkSafety.bind(agentController));
    router.get('/location-score', agentController.checkLocationScore.bind(agentController));

    router.post('/onboarding/evvm-name-service', evvmController.onboardViaNameService.bind(evvmController));
    router.get('/debug/hackers', evvmController.listHackers.bind(evvmController));

    return router;
}
