import { getRefinedAnswer } from "./getRefinedAnswer";

const input = {
  question: "Summarize why teamwork is important.",
  requiredWord: "collaboration",
};

(async () => {
  console.log("starting self-refinement process...");
  console.log("Input question:", input.question);
  console.log("Required word:", input.requiredWord, "\n\n");
  const result = await getRefinedAnswer(input);
  console.log("Final answer:", result);
})();
