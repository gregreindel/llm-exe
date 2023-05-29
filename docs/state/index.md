## State

When calling an LLM from your code, the LLM only knows the history you provide it.

When using llm-exe, the state is something you need to manage. To help with `memory`, we provide a simple state module. 

The state module consists of 3 concepts:
- Dialogues
- Context
- Attributes

Dialogues are a place to store conversation history, internal dialogues, really any conversation that is taking place with an LLM.

TODO:
Describe Context & Attributes. In summary, attributes are meant to be a basic object, context can more robust classes.


State has a `saveState()` method that can be customized to save the state to a database.


```typescript:no-line-numbers
const state = createState()

const chatHistory = state.createDialogue("chatHistory");

chatHistory.setUserMessage("Hey anyone there?");

chatHistory.setAssistantMessage("Yep! Whats up?");

// this ends to be implemented by you if you want to save somewhere
await state.saveState()
```


### Dialogue
Internally, `state` uses the `Dialogue` class to manage dialogues, and you can use it independently too if you'd like.

```typescript:no-line-numbers
const chatHistory = createDialogue("chat");

chatHistory.setUserMessage("Hey anyone there?");

chatHistory.setAssistantMessage("Yep! Whats up?");

const history = chatHistory.getHistory()

/**
 * 
 * console.log(history)
 * 
 * [{ 
 *   role: 'user',
 *   content: 'Hey anyone there?'
 * },{ 
 *   role: 'assistant', 
 *   content: 'Yep! Whats up?' 
 * }]
 * 
 */
```

```typescript:no-line-numbers
const chatHistory = createDialogue("chat");

// setMessageTurn accepts (<user message>, <assistant message>)
chatHistory.setMessageTurn("Hey anyone there?", "Yep! Whats up?");

const history = chatHistory.getHistory()

/**
 * 
 * console.log(history)
 * 
 * [{ 
 *   role: 'user',
 *   content: 'Hey anyone there?'
 * },{ 
 *   role: 'assistant', 
 *   content: 'Yep! Whats up?' 
 * }]
 * 
 */

```