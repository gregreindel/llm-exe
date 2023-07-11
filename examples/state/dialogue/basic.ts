import { createDialogue } from "@/state";

const exampleOne = () => {
// START example
const chatHistory = createDialogue("chat")
.setUserMessage("Hey anyone there?")
.setAssistantMessage("Yep! Whats up?")

const history = chatHistory.getHistory()
    
console.log(history)
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