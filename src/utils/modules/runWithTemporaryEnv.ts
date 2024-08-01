export async function runWithTemporaryEnv<R>(
  env: () => void,
  handler: () => Promise<R>
): Promise<R> {
  const previousEnv = { ...process.env };
  try {
    env();
    const value = await handler();
    return value;
  } finally {
    process.env = previousEnv;
  }
}
