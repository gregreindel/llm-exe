import { createPrompt, createChatPrompt } from "../../src/prompt"; // this needs to be here for examples to build

const exampleCreateChatPrompt = () => {
// #region exampleCreateChatPrompt
const prompt = createPrompt("chat")
// or const prompt = createChatPrompt()
// #endregion exampleCreateChatPrompt
// exporting for docs
return {
    prompt,
    format: {},
    display: prompt
}
// END example
}
    
const exampleCreateChatPromptWithSystem = () => {
 // #region exampleCreateChatPromptWithSystem   
const message = `You are a customer service agent for Some Company.`
const prompt = createPrompt("chat", message)
// #endregion exampleCreateChatPromptWithSystem
// exporting for docs
return {
prompt,
format: {},
display: prompt
}
// END example
}

const exampleCreateChatPromptUseFormat = () => {
// #region exampleCreateChatPromptUseFormat
const message = `You are a customer service agent for Some Company.`
const prompt = createPrompt("chat", message)

// The output of format is an array of chat messages
const formatted = prompt.format({});
// #endregion exampleCreateChatPromptUseFormat
// exporting for docs
return {
prompt,
format: {},
display: formatted
}
// END example
}

const exampleCreateChatPromptWithAssistant = () => {
// #region exampleCreateChatPromptWithAssistant
const message = `You are a customer service agent for Some Company.`
const prompt = createChatPrompt(message)
    
// You can add user and assistant messages
prompt.addUserMessage("Hello there")
prompt.addAssistantMessage("Welcome to Some Company, how can I help you?")
// #endregion exampleCreateChatPromptWithAssistant
// exporting for docs
return {
    prompt,
    format: {},
    display: prompt.format({})

}
// END example
}

// // exporting for docs
export const examples = {
    exampleCreateChatPrompt,
    exampleCreateChatPromptWithSystem,
    exampleCreateChatPromptUseFormat,
    exampleCreateChatPromptWithAssistant
}