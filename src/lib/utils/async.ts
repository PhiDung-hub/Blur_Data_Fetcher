export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Retry wrapper for executing a function multiple times in case of an error.
 * 
 * @param {Function} fn - The function to be executed.
 * @param {number} retries - The number of retries.
 * @returns {Promise} - Returns a promise if `fn` is async or the result of `fn` if it's sync.
 */
export async function retryWrapper(
  { fn, retries = 5, fnIdentifier = "_anon", log = false }: { fn: Function, fnIdentifier?: string, retries?: number, log?: boolean }
) {
  for (let i = 0; i < retries; i++) {
    try {
      // If `fn` returns a promise, await it
      if (fn.constructor.name === 'AsyncFunction') {
        return await fn();
      }
      // If `fn` is synchronous, return its result
      return fn();
    } catch (error) {
      if (i === retries - 1) { // If it's the last retry, throw the error
        throw error;
      }
      if (log) {
        console.warn(`Log - ${fnIdentifier}: Attempt ${i + 1} failed. Retrying...`);
      }
    }
  }
}

export async function exhaustGenerator(generator: Generator | AsyncGenerator): Promise<void> {
  let next = await generator.next();
  while (!next.done) {
    next = await generator.next();
  }
}
