export const asyncCallWithTimeout = async <T = any>(
  asyncPromise: Promise<T>,
  timeLimit = 10000
): Promise<T> => {
  let timeoutHandle: any;

  const timeoutPromise = new Promise((_resolve, reject) => {
    timeoutHandle = setTimeout(() => {
      return reject(
        new Error("Unable to perform action. Try again, or use another action.")
      );
    }, timeLimit);
  });

  return Promise.race([asyncPromise, timeoutPromise]).then((result) => {
    clearTimeout(timeoutHandle);
    return result;
  }) as Promise<T>;
};
