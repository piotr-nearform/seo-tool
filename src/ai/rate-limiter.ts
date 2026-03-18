/**
 * Creates a concurrency limiter that limits the number of concurrent async operations.
 *
 * @param maxConcurrent - Maximum number of operations that can run simultaneously
 * @returns A function that wraps async operations with concurrency control
 */
export function createConcurrencyLimiter(
  maxConcurrent: number,
): <T>(fn: () => Promise<T>) => Promise<T> {
  let running = 0;
  const queue: Array<() => void> = [];

  function tryNext(): void {
    if (queue.length > 0 && running < maxConcurrent) {
      running++;
      const next = queue.shift()!;
      next();
    }
  }

  return <T>(fn: () => Promise<T>): Promise<T> => {
    return new Promise<T>((resolve, reject) => {
      const execute = (): void => {
        fn()
          .then(resolve)
          .catch(reject)
          .finally(() => {
            running--;
            tryNext();
          });
      };

      if (running < maxConcurrent) {
        running++;
        execute();
      } else {
        queue.push(execute);
      }
    });
  };
}
