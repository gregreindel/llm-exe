import { createDialogue } from "@/state";

const dialogueWithFunctionCall = () => {
  // START example
const function_call = {
  name: "get_weather",
  arguments: '{"city": "Cleveland"}',
};
  
const chatHistory = createDialogue("chat")
.setUserMessage("What is the weather in Cleveland?")
.setFunctionCallMessage({ function_call })
.setFunctionMessage('{ "weather": "Cold, rainy" }', "get_weather")
.setAssistantMessage("Looks like normal weather in Cleveland");

const history = chatHistory.getHistory()


// exporting for docs
return {
  display: history
}
// END example
}

  


// exporting for docs
export const examples = {
  dialogueWithFunctionCall
};
