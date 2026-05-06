/**
 * Live Execution Engine
 * Real-time tool execution with WebSocket streaming and output capture
 */

import { EventEmitter } from 'events';

export interface ExecutionJob {
  id: string;
  toolId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused';
  startTime: Date;
  endTime?: Date;
  output: string;
  error?: string;
  progress: number; // 0-100
}

export interface ExecutionPlan {
  id: string;
  jobs: ExecutionJob[];
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused';
  totalJobs: number;
  completedJobs: number;
  failedJobs: number;
  startTime?: Date;
  endTime?: Date;
}

export class LiveExecutionEngine extends EventEmitter {
  private executionPlans: Map<string, ExecutionPlan> = new Map();
  private executingJobs: Map<string, ExecutionJob> = new Map();
  private maxConcurrentJobs: number = 5;

  /**
   * Create execution plan
   */
  createExecutionPlan(planId: string, toolIds: string[]): ExecutionPlan {
    const jobs: ExecutionJob[] = toolIds.map((toolId, index) => ({
      id: `job-${index}`,
      toolId,
      status: 'pending',
      startTime: new Date(),
      output: '',
      progress: 0,
    }));

    const plan: ExecutionPlan = {
      id: planId,
      jobs,
      status: 'pending',
      totalJobs: jobs.length,
      completedJobs: 0,
      failedJobs: 0,
    };

    this.executionPlans.set(planId, plan);
    return plan;
  }

  /**
   * Start execution
   */
  async startExecution(planId: string): Promise<void> {
    const plan = this.executionPlans.get(planId);
    if (!plan) throw new Error(`Plan ${planId} not found`);

    plan.status = 'running';
    plan.startTime = new Date();
    this.emit('plan-started', plan);

    // Execute jobs with concurrency control
    const pendingJobs = plan.jobs.filter(j => j.status === 'pending');
    await this.executeJobsWithConcurrency(pendingJobs);

    plan.status = plan.failedJobs > 0 ? 'failed' : 'completed';
    plan.endTime = new Date();
    this.emit('plan-completed', plan);
  }

  /**
   * Execute jobs with concurrency control
   */
  private async executeJobsWithConcurrency(jobs: ExecutionJob[]): Promise<void> {
    const executing: Promise<void>[] = [];

    for (const job of jobs) {
      // Wait if max concurrent jobs reached
      while (this.executingJobs.size >= this.maxConcurrentJobs) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      const jobPromise = this.executeJob(job);
      executing.push(jobPromise);
    }

    await Promise.all(executing);
  }

  /**
   * Execute single job
   */
  private async executeJob(job: ExecutionJob): Promise<void> {
    this.executingJobs.set(job.id, job);
    job.status = 'running';
    job.startTime = new Date();

    try {
      this.emit('job-started', job);

      // Simulate tool execution with progress updates
      await this.simulateToolExecution(job);

      job.status = 'completed';
      job.progress = 100;
      this.emit('job-completed', job);
    } catch (error) {
      job.status = 'failed';
      job.error = (error as Error).message;
      this.emit('job-failed', job);
    } finally {
      job.endTime = new Date();
      this.executingJobs.delete(job.id);

      // Update plan stats
      const plan = Array.from(this.executionPlans.values()).find(p =>
        p.jobs.some(j => j.id === job.id)
      );
      if (plan) {
        plan.completedJobs = plan.jobs.filter(j => j.status === 'completed').length;
        plan.failedJobs = plan.jobs.filter(j => j.status === 'failed').length;
      }
    }
  }

  /**
   * Simulate tool execution
   */
  private async simulateToolExecution(job: ExecutionJob): Promise<void> {
    const duration = Math.random() * 5000 + 2000; // 2-7 seconds
    const steps = 10;
    const stepDuration = duration / steps;

    for (let i = 0; i < steps; i++) {
      await new Promise(resolve => setTimeout(resolve, stepDuration));

      job.progress = Math.round(((i + 1) / steps) * 100);
      job.output += `[${new Date().toISOString()}] Executing step ${i + 1}/${steps}\n`;

      this.emit('job-progress', job);
    }

    // Add final output
    job.output += `\n[${new Date().toISOString()}] Tool execution completed successfully\n`;
  }

  /**
   * Pause execution
   */
  pauseExecution(planId: string): void {
    const plan = this.executionPlans.get(planId);
    if (!plan) throw new Error(`Plan ${planId} not found`);

    plan.status = 'paused';
    this.emit('plan-paused', plan);
  }

  /**
   * Resume execution
   */
  async resumeExecution(planId: string): Promise<void> {
    const plan = this.executionPlans.get(planId);
    if (!plan) throw new Error(`Plan ${planId} not found`);

    const pausedJobs = plan.jobs.filter(j => j.status === 'pending');
    if (pausedJobs.length > 0) {
      await this.executeJobsWithConcurrency(pausedJobs);
    }

    plan.status = 'completed';
    this.emit('plan-resumed', plan);
  }

  /**
   * Cancel execution
   */
  cancelExecution(planId: string): void {
    const plan = this.executionPlans.get(planId);
    if (!plan) throw new Error(`Plan ${planId} not found`);

    plan.jobs.forEach(job => {
      if (job.status === 'pending' || job.status === 'running') {
        job.status = 'failed';
        job.error = 'Execution cancelled by user';
      }
    });

    plan.status = 'failed';
    this.emit('plan-cancelled', plan);
  }

  /**
   * Get execution plan
   */
  getExecutionPlan(planId: string): ExecutionPlan | undefined {
    return this.executionPlans.get(planId);
  }

  /**
   * Get job output
   */
  getJobOutput(planId: string, jobId: string): string {
    const plan = this.executionPlans.get(planId);
    const job = plan?.jobs.find(j => j.id === jobId);
    return job?.output || '';
  }

  /**
   * Stream job output to WebSocket
   */
  streamJobOutput(planId: string, jobId: string, callback: (output: string) => void): void {
    const plan = this.executionPlans.get(planId);
    const job = plan?.jobs.find(j => j.id === jobId);

    if (!job) return;

    // Send initial output
    callback(job.output);

    // Listen for progress updates
    const onProgress = (updatedJob: ExecutionJob) => {
      if (updatedJob.id === jobId) {
        callback(updatedJob.output);
      }
    };

    this.on('job-progress', onProgress);

    // Clean up listener when job completes
    const onCompleted = (completedJob: ExecutionJob) => {
      if (completedJob.id === jobId) {
        this.removeListener('job-progress', onProgress);
        this.removeListener('job-completed', onCompleted);
      }
    };

    this.on('job-completed', onCompleted);
  }

  /**
   * Get execution statistics
   */
  getExecutionStats(planId: string): any {
    const plan = this.executionPlans.get(planId);
    if (!plan) return null;

    const completedJobs = plan.jobs.filter(j => j.status === 'completed');
    const failedJobs = plan.jobs.filter(j => j.status === 'failed');
    const totalDuration = plan.endTime && plan.startTime
      ? (plan.endTime.getTime() - plan.startTime.getTime()) / 1000
      : 0;

    return {
      totalJobs: plan.totalJobs,
      completedJobs: completedJobs.length,
      failedJobs: failedJobs.length,
      successRate: ((completedJobs.length / plan.totalJobs) * 100).toFixed(2),
      totalDuration: `${totalDuration.toFixed(2)}s`,
      averageJobDuration: completedJobs.length > 0
        ? `${(totalDuration / completedJobs.length).toFixed(2)}s`
        : 'N/A',
    };
  }
}

export const createLiveExecutionEngine = (): LiveExecutionEngine => {
  return new LiveExecutionEngine();
};
