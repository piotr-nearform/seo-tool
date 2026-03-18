import { describe, it, expect } from 'vitest';
import { createConcurrencyLimiter } from '../../../src/ai/rate-limiter.js';

// --- Story 5.5: Rate limiter / concurrency control ---

describe('concurrency limiter', () => {
  it('should execute a single task', async () => {
    const limiter = createConcurrencyLimiter(5);
    const result = await limiter(() => Promise.resolve(42));
    expect(result).toBe(42);
  });

  it('should propagate rejections', async () => {
    const limiter = createConcurrencyLimiter(5);
    await expect(
      limiter(() => Promise.reject(new Error('fail'))),
    ).rejects.toThrow('fail');
  });

  it('should limit concurrent operations to maxConcurrent', async () => {
    const maxConcurrent = 2;
    const limiter = createConcurrencyLimiter(maxConcurrent);

    let running = 0;
    let maxRunning = 0;

    const createTask = () =>
      limiter(async () => {
        running++;
        maxRunning = Math.max(maxRunning, running);
        // Simulate async work
        await new Promise((resolve) => setTimeout(resolve, 50));
        running--;
        return maxRunning;
      });

    // Launch 6 tasks that should be limited to 2 concurrent
    const results = await Promise.all([
      createTask(),
      createTask(),
      createTask(),
      createTask(),
      createTask(),
      createTask(),
    ]);

    expect(maxRunning).toBe(maxConcurrent);
    // All tasks should complete
    expect(results).toHaveLength(6);
  });

  it('should allow up to maxConcurrent tasks to start immediately', async () => {
    const maxConcurrent = 3;
    const limiter = createConcurrencyLimiter(maxConcurrent);

    let running = 0;
    let maxRunning = 0;
    const resolvers: Array<() => void> = [];

    const createTask = () =>
      limiter(
        () =>
          new Promise<void>((resolve) => {
            running++;
            maxRunning = Math.max(maxRunning, running);
            resolvers.push(() => {
              running--;
              resolve();
            });
          }),
      );

    // Start 5 tasks
    const promises = [
      createTask(),
      createTask(),
      createTask(),
      createTask(),
      createTask(),
    ];

    // Give microtasks time to run
    await new Promise((resolve) => setTimeout(resolve, 10));

    // Only 3 should be running
    expect(running).toBe(3);
    expect(maxRunning).toBe(3);

    // Resolve all
    for (const resolver of resolvers) resolver();
    // Wait for queued tasks to start and their resolvers to be added
    await new Promise((resolve) => setTimeout(resolve, 10));
    for (const resolver of resolvers) resolver();

    await Promise.all(promises);
  });

  it('should handle tasks completing in different order', async () => {
    const limiter = createConcurrencyLimiter(2);
    const order: number[] = [];

    const task1 = limiter(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      order.push(1);
      return 1;
    });
    const task2 = limiter(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      order.push(2);
      return 2;
    });
    const task3 = limiter(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      order.push(3);
      return 3;
    });

    const results = await Promise.all([task1, task2, task3]);

    expect(results).toEqual([1, 2, 3]);
    // Task 2 should finish before task 1 since it's faster
    expect(order.indexOf(2)).toBeLessThan(order.indexOf(1));
  });

  it('should work with maxConcurrent = 1 (sequential)', async () => {
    const limiter = createConcurrencyLimiter(1);
    const order: number[] = [];

    const task = (id: number, delay: number) =>
      limiter(async () => {
        await new Promise((resolve) => setTimeout(resolve, delay));
        order.push(id);
        return id;
      });

    await Promise.all([task(1, 30), task(2, 10), task(3, 10)]);

    // With concurrency 1, tasks run in order of submission
    expect(order).toEqual([1, 2, 3]);
  });
});
