import { Router } from 'express';
import { AgentController } from '../controllers/AgentController.js';

const router = Router();

router.get('/prompts', AgentController.getPrompts);
router.post('/search', AgentController.search);

export default router;
