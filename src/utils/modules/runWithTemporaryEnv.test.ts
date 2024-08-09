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
});