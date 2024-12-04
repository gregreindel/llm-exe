export async function resolveAsPromise<T>(fn: () => T | Promise<T>): Promise<T> {
    if (typeof fn === 'function') {
      return Promise.resolve(fn());
    }
    throw new TypeError('Expected a function as an argument.');
  }
  