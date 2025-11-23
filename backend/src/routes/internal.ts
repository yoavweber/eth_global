import { Router } from 'express';
import { EvvmNameServiceController } from '../controllers/EvvmNameServiceController.js';
import { AppDependencies } from '../container.js';

export function createInternalRoutes(dependencies: AppDependencies) {
    const router = Router();
    const controller = new EvvmNameServiceController(dependencies);

    router.post('/evvm/name-service/sync', controller.syncNameService.bind(controller));

    return router;
}

