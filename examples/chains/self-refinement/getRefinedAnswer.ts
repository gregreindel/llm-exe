// #region file
// #region imports
import { checkAnswer } from "./checkAnswer";
import { generateAnswer } from "./generateAnswer";
// #endregion imports

// #region function
export async function getRefinedAnswer(input: {
  question: string;
  requiredWord: string;
}) {
  // Orchestration function:
  // This function attempts to generate an acceptable answer to the input question.
  // It will retry up to 3 times until the generated answer includes the required word
  // and is under the word limit.

  let answer = "";

  const state = {
    attempt: 0,
  };

  while (state.attempt < 3) {
    // Increment attempt counter to avoid infinite loops
    state.attempt++;

    // Step 1: Generate an answer
    answer = await generateAnswer(input);

    // Step 2: Validate answer using a second LLM function
    const { hasWord, underLimit } = await checkAnswer({
      answer,
      requiredWord: input.requiredWord,
    });

    // Step 3: If criteria met, return the result
    if (hasWord && underLimit) {
      console.log("Answer accepted on attempt", state.attempt);
      return answer;
    }

    // Step 4: If criteria not met, log and prepare to retry
    console.log(`Attempt ${state.attempt} failed criteria:`, {
      hasWord,
      underLimit,
    });

    // Note: Could enhance feedback by modifying input between attempts
    // e.g. by changing the question or giving hints on what failed
    // This is a simple example, so we just retry with the same input
  }

  // Final fallback: return last attempt (may not meet criteria)
  return answer;
}
// #endregion function
// #endregion file
