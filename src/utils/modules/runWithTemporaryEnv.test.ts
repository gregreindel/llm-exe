import { runWithTemporaryEnv } from "@/utils/modules/runWithTemporaryEnv";

describe("runWithTemporaryEnv", () => {
  it("should set temporary environment variables and restore them on success", async () => {
    const previousValue = process.env.TEST_VAR;
    
    const result = await runWithTemporaryEnv(
      () => {
        process.env.TEST_VAR = "temporary";
      },
      async () => {
        return process.env.TEST_VAR;
      }
    );

    expect(result).toBe("temporary");
    expect(process.env.TEST_VAR).toBe(previousValue);
  });

  it("should set temporary environment variables and restore them on error", async () => {
    const previousValue = process.env.TEST_VAR;
    
    try {
      await runWithTemporaryEnv(
        () => {
          process.env.TEST_VAR = "temporary";
        },
        async () => {
          throw new Error("test error");
        }
      );
    } catch (e) {
      expect((e as Error).message).toBe("test error");
    }

    expect(process.env.TEST_VAR).toBe(previousValue);
  });

  it("should handle cases with no environment changes", async () => {
    const previousValue = process.env.TEST_VAR;

    const result = await runWithTemporaryEnv(
      () => {
        // no changes
      },
      async () => {
        return "no changes";
      }
    );

    expect(result).toBe("no changes");
    expect(process.env.TEST_VAR).toBe(previousValue);
  });

  it("should properly restore deleted environment variables", async () => {
    // Set a value that we'll delete
    process.env.TEST_DELETE_VAR = "original";
    
    const result = await runWithTemporaryEnv(
      () => {
        delete process.env.TEST_DELETE_VAR;
      },
      async () => {
        return process.env.TEST_DELETE_VAR;
      }
    );

    expect(result).toBeUndefined();
    expect(process.env.TEST_DELETE_VAR).toBe("original");
    
    // Clean up
    delete process.env.TEST_DELETE_VAR;
  });

  it("should handle multiple environment variable changes", async () => {
    const original1 = process.env.TEST_VAR_1;
    const original2 = process.env.TEST_VAR_2;
    const original3 = process.env.TEST_VAR_3;
    
    const result = await runWithTemporaryEnv(
      () => {
        process.env.TEST_VAR_1 = "temp1";
        process.env.TEST_VAR_2 = "temp2";
        process.env.TEST_VAR_3 = "temp3";
      },
      async () => {
        return {
          var1: process.env.TEST_VAR_1,
          var2: process.env.TEST_VAR_2,
          var3: process.env.TEST_VAR_3,
        };
      }
    );

    expect(result).toEqual({
      var1: "temp1",
      var2: "temp2",
      var3: "temp3",
    });
    
    expect(process.env.TEST_VAR_1).toBe(original1);
    expect(process.env.TEST_VAR_2).toBe(original2);
    expect(process.env.TEST_VAR_3).toBe(original3);
  });

  it("should restore environment variables that didn't exist before", async () => {
    // Ensure these don't exist
    delete process.env.NEW_TEST_VAR_1;
    delete process.env.NEW_TEST_VAR_2;
    
    await runWithTemporaryEnv(
      () => {
        process.env.NEW_TEST_VAR_1 = "new1";
        process.env.NEW_TEST_VAR_2 = "new2";
      },
      async () => {
        expect(process.env.NEW_TEST_VAR_1).toBe("new1");
        expect(process.env.NEW_TEST_VAR_2).toBe("new2");
      }
    );

    expect(process.env.NEW_TEST_VAR_1).toBeUndefined();
    expect(process.env.NEW_TEST_VAR_2).toBeUndefined();
  });

  it("should handle overwriting the same variable multiple times", async () => {
    const original = process.env.MULTI_CHANGE_VAR;
    process.env.MULTI_CHANGE_VAR = "initial";
    
    await runWithTemporaryEnv(
      () => {
        process.env.MULTI_CHANGE_VAR = "first";
        process.env.MULTI_CHANGE_VAR = "second";
        process.env.MULTI_CHANGE_VAR = "third";
      },
      async () => {
        expect(process.env.MULTI_CHANGE_VAR).toBe("third");
      }
    );

    expect(process.env.MULTI_CHANGE_VAR).toBe("initial");
    
    // Restore original
    if (original === undefined) {
      delete process.env.MULTI_CHANGE_VAR;
    } else {
      process.env.MULTI_CHANGE_VAR = original;
    }
  });

  it("should handle async errors in handler and still restore environment", async () => {
    const original = process.env.ERROR_TEST_VAR;
    
    await expect(
      runWithTemporaryEnv(
        () => {
          process.env.ERROR_TEST_VAR = "temporary";
        },
        async () => {
          await new Promise(resolve => setTimeout(resolve, 10));
          throw new Error("Async error");
        }
      )
    ).rejects.toThrow("Async error");

    expect(process.env.ERROR_TEST_VAR).toBe(original);
  });

  it("should handle errors in env setup and still restore environment", async () => {
    const original = process.env.SETUP_ERROR_VAR;
    
    await expect(
      runWithTemporaryEnv(
        () => {
          process.env.SETUP_ERROR_VAR = "temporary";
          throw new Error("Setup error");
        },
        async () => {
          return "should not reach here";
        }
      )
    ).rejects.toThrow("Setup error");

    // Environment should still be restored even if setup throws
    expect(process.env.SETUP_ERROR_VAR).toBe(original);
  });
});