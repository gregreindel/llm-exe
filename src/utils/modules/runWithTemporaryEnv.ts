export async function runWithTemporaryEnv<R>(
  env: () => void,
  handler: () => Promise<R>
): Promise<R> {
  // Store original values for all env vars that will be modified
  const modifiedKeys: string[] = [];
  const originalValues: Record<string, string | undefined> = {};
  
  // Capture the current state before any modifications
  const envBefore = { ...process.env };
  
  try {
    // Run the environment setup
    try {
      env();
    } catch (envError) {
      // Track environment changes even if setup throws
      // This ensures cleanup happens regardless of errors
      const envAfter = process.env;
      for (const key in envAfter) {
        if (envBefore[key] !== envAfter[key]) {
          modifiedKeys.push(key);
          originalValues[key] = envBefore[key];
        }
      }
      
      // Also track keys that were deleted during setup
      for (const key in envBefore) {
        if (!(key in envAfter) && !modifiedKeys.includes(key)) {
          modifiedKeys.push(key);
          originalValues[key] = envBefore[key];
        }
      }
      
      // Re-throw the error after tracking changes
      throw envError;
    }
    
    // Determine which keys were modified by comparing before and after
    const envAfter = process.env;
    for (const key in envAfter) {
      if (envBefore[key] !== envAfter[key]) {
        modifiedKeys.push(key);
        originalValues[key] = envBefore[key];
      }
    }
    
    // Also check for keys that existed before but were deleted
    for (const key in envBefore) {
      if (!(key in envAfter) && !modifiedKeys.includes(key)) {
        modifiedKeys.push(key);
        originalValues[key] = envBefore[key];
      }
    }
    
    // Execute the handler
    const value = await handler();
    return value;
  } finally {
    // Restore only the modified values
    for (const key of modifiedKeys) {
      const originalValue = originalValues[key];
      if (originalValue === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = originalValue;
      }
    }
  }
}
