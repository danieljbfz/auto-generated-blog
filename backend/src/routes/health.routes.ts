import { Router } from 'express';
import { healthController } from '../controllers/health.controller.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';

/**
 * Health Check Routes
 * 
 * Provides various health check endpoints for monitoring and debugging.
 * 
 * Route Structure:
 * - GET /api/health            - Basic health check (always returns 200)
 * - GET /api/health/detailed   - Detailed health with component status
 * - GET /api/health/ready      - Readiness probe (Kubernetes-style)
 * - GET /api/health/live       - Liveness probe (Kubernetes-style)
 */
const router = Router();

/**
 * Basic Health Check
 * 
 * GET /api/health
 */
router.get(
  '/',
  asyncHandler(healthController.check.bind(healthController))
);

/**
 * Detailed Health Check
 * 
 * GET /api/health/detailed
 */
router.get(
  '/detailed',
  asyncHandler(healthController.detailed.bind(healthController))
);

/**
 * Readiness Probe
 * 
 * GET /api/health/ready
 */
router.get(
  '/ready',
  asyncHandler(healthController.ready.bind(healthController))
);

/**
 * Liveness Probe
 * 
 * GET /api/health/live
 */
router.get(
  '/live',
  asyncHandler(healthController.live.bind(healthController))
);

export default router;