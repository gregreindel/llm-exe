import { createPrompt, createChatPrompt } from "../../src/prompt"; // this needs to be here for examples to build

const exampleOne = () => {
  // #region exampleOne
  const instruction = `You are a customer service agent for Some Company.

Your name is {{agentName}}.`;

  const prompt = createPrompt("text", instruction);

  const formatted = prompt.format({ agentName: "Greg" });
  // #endregion exampleOne
  // exporting for docs
  return {
    prompt,
    format: { agentName: "Greg" },
    display: formatted,
  };
  // END example
};

const exampleTwo = () => {
  // #region exampleTwo
  interface SomePromptInput {
    agentName: string;
  }

  const prompt = createChatPrompt<SomePromptInput>(
    "Your name is {{agentName}}"
  );

  // @ts-expect-error - example
  // Bad. Incorrect input, Typescript error.
  // Argument of type '{ name: string; }' is not assignable to parameter of type 'SomePromptInput'.
  prompt.format({ name: "Greg" });

  // Good: No problem, correct inputs
  prompt.format({ agentName: "Greg" });
  // #endregion exampleTwo
  // exporting for docs
  return {
    prompt,
    format: { agentName: "Greg" },
    display: prompt,
  };
  // END example
};

// // exporting for docs
export const examples = {
  exampleOne,
  exampleTwo,
};
