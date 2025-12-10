import { Request, Response } from 'express';
import { prisma } from '../config/database.js';
import { env } from '../config/env.js';

/**
 * Health Controller
 * 
 * Provides health check and status endpoints for monitoring and debugging.
 * Used by load balancers, monitoring tools, and DevOps.
 */
export class HealthController {
  
  /**
   * Basic Health Check
   * 
   * GET /health
   * 
   * @returns 200 OK if the server is healthy
   */
  async check(_req: Request, res: Response): Promise<void> {
    res.status(200).json({
      success: true,
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: env.NODE_ENV,
    });
  }
  
  /**
   * Detailed Health Check
   * 
   * GET /health/detailed
   * 
   * @returns 200 OK if the server is healthy, 503 if any component fails
   */
  async detailed(_req: Request, res: Response): Promise<void> {
    const checks = {
      database: false,
      memory: false,
    };
    
    // Check database connection
    try {
      await prisma.$queryRaw`SELECT 1`;
      checks.database = true;
    } catch (error) {
      checks.database = false;
    }
    
    // Check memory usage
    const memUsage = process.memoryUsage();
    const memUsageMB = {
      rss: Math.round(memUsage.rss / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      external: Math.round(memUsage.external / 1024 / 1024),
    };
    
    // Consider memory healthy if heap usage < 80% of total
    checks.memory = memUsage.heapUsed < (memUsage.heapTotal * 0.8);
    
    const allHealthy = Object.values(checks).every(check => check === true);
    const statusCode = allHealthy ? 200 : 503;
    
    res.status(statusCode).json({
      success: allHealthy,
      status: allHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: env.NODE_ENV,
      checks,
      system: {
        memory: memUsageMB,
        nodeVersion: process.version,
        platform: process.platform,
      },
    });
  }
  
  /**
   * Readiness Check
   * 
   * GET /health/ready
   * 
   * @returns 200 OK if the service is ready to accept traffic, 503 during startup
   * 
   * @remarks
   * This is similar to the Kubernetes readiness probe.
   */
  async ready(_req: Request, res: Response): Promise<void> {
    try {
      // Verify database is accessible
      await prisma.$queryRaw`SELECT 1`;
      
      res.status(200).json({
        success: true,
        status: 'ready',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(503).json({
        success: false,
        status: 'not_ready',
        timestamp: new Date().toISOString(),
        reason: 'Database not accessible',
      });
    }
  }
  
  /**
   * Liveness Check
   * 
   * GET /health/live
   * 
   * @returns 200 OK if the process is alive (not deadlocked)
   * 
   * @remarks
   * This is similar to the Kubernetes liveness probe.
   */
  async live(_req: Request, res: Response): Promise<void> {
    res.status(200).json({
      success: true,
      status: 'alive',
      timestamp: new Date().toISOString(),
    });
  }
}

// Export singleton instance
export const healthController = new HealthController();