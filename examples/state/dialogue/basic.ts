import { createDialogue } from "llm-exe";

const exampleOne = () => {
// #region exampleOne
const chatHistory = createDialogue("chat")
.setUserMessage("Hey anyone there?")
.setAssistantMessage("Yep! Whats up?")

const history = chatHistory.getHistory()
    
// #endregion exampleOne
// exporting for docs
return {
        display: history
}
// END example
}

// exporting for docs
export const examples = {
    exampleOne
}