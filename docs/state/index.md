# State

When calling an LLM from your code, the LLM only knows the history you provide it.

When using llm-exe, the state is something you need to manage. To help provide a concept of memory to your LLM's, we provide a simple state module. 

The state module consists of 3 concepts:
- Dialogues
- Context
- Attributes

Dialogues are a place to store conversation history, internal dialogues, really any conversation that is taking place with an LLM. You can have one or many dialogues. When you create a new dialogue, you should provide a key, which allows you to access the dialogue from the state later if needed.

**Context** items are instances of `BaseStateItem` — typed classes with `getValue()`, `setValue()`, and `resetValue()` methods. Use context for structured, typed data that needs its own lifecycle (e.g., extracted entities, session config). Create context items with `createStateItem(name, defaultValue)` and add them via `state.createContextItem(item)`.

**Attributes** are a simple key-value store for lightweight metadata. Use `state.setAttribute(key, value)`, `state.deleteAttribute(key)`, and `state.clearAttributes()`.

State has a `saveState()` method that can be customized to save the state to a database.

Initializing a state object is as simple as:
```ts
const state = createState()
```

If you wanted to store a chat conversation dialogue, you could:
```ts
const state = createState()

// this creates a new dialogue in the state, and returns it
const chatHistory = state.createDialogue("chatHistory");

// we can use this directly
// chatHistory.setUserMessage("Hey anyone there?");


// or get again from state object
// state.getDialogue("chatHistory").setAssistantMessage("Yep! Whats up?");
```


Saving state
```ts
// this needs to be implemented by you if you want to save somewhere
await state.saveState()
```