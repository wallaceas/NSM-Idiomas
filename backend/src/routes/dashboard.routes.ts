import { Router } from 'express';
import { DashboardController } from '../controllers/DashboardController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();
const controller = new DashboardController();

router.get('/dashboard', authMiddleware, (req, res) => controller.index(req, res));

export default router;