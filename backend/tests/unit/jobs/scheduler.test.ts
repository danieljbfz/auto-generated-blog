import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { startScheduler, stopScheduler } from '../../../src/jobs/scheduler.js';
import { aiService } from '../../../src/services/ai.service.js';
import * as cron from 'node-cron';

// Mock dependencies
vi.mock('../../../src/services/ai.service.js');
vi.mock('../../../src/jobs/generateArticle.job.js');
vi.mock('../../../src/jobs/publishScheduled.job.js');
vi.mock('node-cron');

describe('Scheduler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  afterEach(() => {
    stopScheduler();
  });
  
  describe('startScheduler', () => {
    it('should initialize AI service', async () => {
      // Arrange
      vi.mocked(aiService.initialize).mockResolvedValue();
      vi.mocked(cron.schedule).mockReturnValue({ stop: vi.fn() } as any);
      
      // Act
      await startScheduler();
      
      // Assert
      expect(aiService.initialize).toHaveBeenCalled();
    });
    
    it('should schedule daily article generation at 2 AM', async () => {
      // Arrange
      vi.mocked(aiService.initialize).mockResolvedValue();
      vi.mocked(cron.schedule).mockReturnValue({ stop: vi.fn() } as any);
      
      // Act
      await startScheduler();
      
      // Assert
      expect(cron.schedule).toHaveBeenCalledWith(
        '0 2 * * *',
        expect.any(Function)
      );
    });
    
    it('should schedule publishing check every minute', async () => {
      // Arrange
      vi.mocked(aiService.initialize).mockResolvedValue();
      vi.mocked(cron.schedule).mockReturnValue({ stop: vi.fn() } as any);
      
      // Act
      await startScheduler();
      
      // Assert
      expect(cron.schedule).toHaveBeenCalledWith(
        '* * * * *',
        expect.any(Function)
      );
    });
  });
  
  describe('stopScheduler', () => {
    it('should stop all scheduled tasks', async () => {
      // Arrange
      const mockStop = vi.fn();
      vi.mocked(aiService.initialize).mockResolvedValue();
      vi.mocked(cron.schedule).mockReturnValue({ stop: mockStop } as any);
      
      await startScheduler();
      
      // Act
      stopScheduler();
      
      // Assert
      expect(mockStop).toHaveBeenCalledTimes(2);
    });
  });
});