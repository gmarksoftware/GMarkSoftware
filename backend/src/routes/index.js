import express from 'express';
import healthRoutes from './healthRoutes.js';
import contactRoutes from './contactRoutes.js';
import authRoutes from './authRoutes.js';

const router = express.Router();

router.use('/', healthRoutes);
router.use('/', contactRoutes);
router.use('/', authRoutes);

export default router;
