export const finalAnswerCallable = {
  name: "final_answer",
  description: "When you know the final answer to the question",
  input: `A string, the final answer and brief summary of how you came to that conclusion.`,
  handler: async (_input: any) => {
    return {
      result: _input.input,
      attributes: {},
    }; 
  },
};
