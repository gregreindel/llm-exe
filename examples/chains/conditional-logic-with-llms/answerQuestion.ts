import { createClassificationExecutor } from "./createClassificationExecutor";
import { createCreativeExecutor } from "./createCreativeExecutor";
import { createFactualExecutor } from "./createFactualExecutor";

/**
 * Orchestrates the flow by classifying the question and delegating to the appropriate executor
 */
export async function answerQuestion(question: string): Promise<string> {
  const category = await createClassificationExecutor({ question });

  if (category === "technical") {
    return createFactualExecutor({ question });
  } else {
    return createCreativeExecutor({ question });
  }
}
