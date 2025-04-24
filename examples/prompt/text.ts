import { createPrompt } from "../../src/prompt"; // this needs to be here for examples to build

const exampleCreateTextPrompt = () => {
  // #region exampleCreateTextPrompt
  // create a simple text prompt
  const prompt = createPrompt("text");
  // #endregion exampleCreateTextPrompt
  // exporting for docs
  return {
    prompt,
    format: {},
    display: prompt,
  };
  // END example
};

const exampleCreateTextPromptWithInitial = () => {
  // #region exampleCreateTextPromptWithInitial
  const initial = "You are a customer service agent for SomeCompany.";
  const prompt = createPrompt("text", initial);
  // #endregion exampleCreateTextPromptWithInitial
  // exporting for docs
  return {
    prompt,
    format: {},
    display: prompt,
  };
  // END example
};

const exampleCreateTextPromptAddToPrompt = () => {
  // #region exampleCreateTextPromptAddToPrompt
  // create a simple text prompt with an initial system message
  const initial = "You are a customer service agent for SomeCompany.";
  const prompt = createPrompt("text", initial);

  // add an additional system message to the prompt
  prompt.addToPrompt("You should never admit that you are AI.");
  // #endregion exampleCreateTextPromptAddToPrompt
  // exporting for docs
  return {
    prompt,
    format: {},
    display: prompt,
  };
  // END example
};

const exampleCreateTextPromptFormat = () => {
  // #region exampleCreateTextPromptFormat
  // create a simple text prompt with an initial system message
  const initial = "You are a customer service agent for SomeCompany.";
  const prompt = createPrompt("text", initial);

  // add an additional system message to the prompt
  prompt.addToPrompt("You should never admit that you are AI.");

  // format the prompt with values
  const formatted = prompt.format({});
  // #endregion exampleCreateTextPromptFormat
  // exporting for docs
  return {
    prompt,
    format: {},
    display: formatted,
  };
  // END example
};

const exampleCreateTextPromptChainable = () => {
  // #region exampleCreateTextPromptChainable

  const initial = "You are a customer service agent for SomeCompany.";
  const prompt = createPrompt("text", initial);

  // you can also chain all prompt methods (except format)
  prompt
    .addToPrompt("You should never admit that you are AI.")
    .addToPrompt("Begin!");
  // #endregion exampleCreateTextPromptChainable

  // exporting for docs
  return {
    prompt,
    format: {},
    display: prompt,
  };
  // END example
};

const exampleCreateTextPromptCustomDelimiter = () => {
  // #region exampleCreateTextPromptCustomDelimiter

  const initial = "You are a customer service agent for SomeCompany.";
  const prompt = createPrompt("text", initial)
    .addToPrompt("You should never admit that you are AI.")
    .addToPrompt("Begin!");

  // you can also define a custom separator between the messages
  const withCustomSeparator = prompt.format({}, "\n---\n");
  // #endregion exampleCreateTextPromptCustomDelimiter
  // exporting for docs
  return {
    prompt,
    format: {},
    display: withCustomSeparator,
  };
  // END example
};

// // exporting for docs
export const examples = {
  exampleCreateTextPrompt,
  exampleCreateTextPromptWithInitial,
  exampleCreateTextPromptAddToPrompt,
  exampleCreateTextPromptFormat,
  exampleCreateTextPromptChainable,
  exampleCreateTextPromptCustomDelimiter,
};
