import { createChatPrompt } from "@/prompt"
import { IChatMessages } from "@/types"

const withReplacements = () => {
// START example
const prompt = createChatPrompt("Your name is {{agentName}}")
const formatted = prompt.format({agentName: "Greg"})

// exporting for docs
return {
    prompt,
    format: { agentName: "Greg" },
    display: formatted
}
// END example
}


const withReplacementsTwo = () => {
// START example
const prompt = createChatPrompt("Your name is {{agentName}}")

const template = `{{#if fruits.length}}
Ask about one of these fruits: 
{{#each fruits as | fruit |}}
- {{fruit}}
{{/each}}
{{/if}}`;

prompt.addSystemMessage(template)

const formatted = prompt.format({
    agentName: "Greg",
    fruits: ["apple", "banana"]
});

// exporting for docs
return {
    prompt,
    format: { agentName: "Greg" },
    display: formatted
}
// END example
}

const withReplacementsAndTypes = () => {
// START example
interface PromptTemplate {
    actions: {
      name: string;
      description: string;
    }[];
    previousSteps: {
      thought: string;
      action: string;
      result: string;
    }[];
  }
  
const template = `You are an agent that can only perform the following actions:
  
# Actions
{{#each actions as | action |}}
{{ action.name }} ({{ action.description }})
{{/each}}
  
# Previous Steps Taken
{{#each previousSteps as | previousStep |}}
Thought: {{previousStep.thought}}
Action: {{previousStep.action}}
{{/each}}`;
  
const instruction = `What step should we take? Must be one of: {{#each actions as | action |}}, {{ action.name }}{{/each}}.`;
  
// some data from state or your application
const history: IChatMessages = [
    { role: "user", content: "Hey!" },
    { role: "assistant", content: "Hi, how are you?" },
    { role: "user", content: "Good. What day is it?" }
];

const actions = [
    { name: "say_hi", description: "Provide an initial greeting." },
    { name: "say_bye", description: "Say goodbye at the end of a conversation." },
    { name: "ask_question", description: "Ask the user a question." },
    { name: "provide_answer", description: "Provide an answer to a question" }
];

const previousSteps = [
    { thought: "I should say hi", action: "say_hi", result: "Hi, how are you?" }
];
  
const prompt = createChatPrompt<PromptTemplate>(template)
    .addFromHistory(history)
    .addSystemMessage(instruction);
  
// prompt.format is well-typed based on the generic you passed into createChatPrompt
const formatted = prompt.format({ actions, previousSteps });
  
// exporting for docs
return {
    prompt,
    format: { agentName: "Greg" },
    display: formatted
}
// END example
}

// // exporting for docs
export const examples = {
    withReplacements,
    withReplacementsTwo,
    withReplacementsAndTypes
}