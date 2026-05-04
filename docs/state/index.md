# State

When calling an LLM from your code, the LLM only knows the history you provide it.

When using llm-exe, the state is something you need to manage. To help provide a concept of memory to your LLMs, we provide a simple state module.

## Quick Start

```ts
import { createState, createStateItem, createDialogue } from "llm-exe";

// Create a state container (takes no arguments)
const state = createState();

// Store conversation history
const chat = state.createDialogue("chat");
chat.setUserMessage("Hello!");

// Store typed data
const mood = createStateItem("mood", "neutral");
state.createContextItem(mood);
mood.setValue("happy");

// Store simple metadata
state.setAttribute("userId", "abc-123");
```

## Concepts

The state module consists of 3 concepts:

| Concept | Purpose | Create with |
|---------|---------|-------------|
| **Dialogues** | Conversation history for LLM interactions | `state.createDialogue(name)` or standalone `createDialogue(name)` |
| **Context** | Typed, named data items with get/set/reset | `createStateItem(name, defaultValue)` + `state.createContextItem(item)` |
| **Attributes** | Simple key-value metadata | `state.setAttribute(key, value)` |

### Dialogues

A place to store conversation history — any conversation taking place with an LLM. You can have one or many dialogues. When you create a new dialogue, provide a key so you can retrieve it from the state later. See the [Dialogue](/state/dialogue.html) page for the full message API.

### Context

Context items are instances of `BaseStateItem` — typed classes with `getValue()`, `setValue()`, and `resetValue()` methods. Use context for structured, typed data that needs its own lifecycle (e.g., extracted entities, session config).

The `defaultValue` you pass to `createStateItem` determines the type — `setValue()` will reject values of a different type at runtime. Always provide a default value.

```ts
import { createState, createStateItem } from "llm-exe";

const state = createState();

// Create a typed context item with a name and default value
const userIntent = createStateItem("userIntent", "unknown");

// Add it to the state
state.createContextItem(userIntent);

// Use getValue/setValue to manage the item
userIntent.getValue();    // "unknown"
userIntent.setValue("booking");
userIntent.getValue();    // "booking"
userIntent.resetValue();  // resets to "unknown"
```

### Attributes

A simple key-value store for lightweight metadata. Use `state.setAttribute(key, value)`, `state.deleteAttribute(key)`, and `state.clearAttributes()`.

## API Reference

### Factory Functions

| Function | Returns | Description |
|----------|---------|-------------|
| `createState()` | `DefaultState` | Creates a new state container. Takes no arguments. |
| `createDialogue(name)` | `Dialogue` | Creates a standalone dialogue (not attached to state). |
| `createStateItem(name, defaultValue)` | `DefaultStateItem` | Creates a typed state item. The `defaultValue` sets the accepted type. |

### State Methods

| Method | Description |
|--------|-------------|
| `state.createDialogue(name)` | Create a new dialogue within the state and return it. |
| `state.getDialogue(name)` | Retrieve a dialogue by name. |
| `state.useDialogue(name)` | Get an existing dialogue or create it if it doesn't exist. |
| `state.createContextItem(item)` | Add a `BaseStateItem` to the state's context. |
| `state.getContext(name)` | Retrieve a context item by name. |
| `state.setAttribute(key, value)` | Set a metadata attribute. |
| `state.deleteAttribute(key)` | Remove a metadata attribute. |
| `state.clearAttributes()` | Remove all metadata attributes. |

## Creating State

Initializing a state object is simple:
```ts
import { createState } from "llm-exe";

const state = createState();
```

## Dialogues

If you want to store a chat conversation dialogue, create one on the state:
```ts
const state = createState();

// this creates a new dialogue in the state, and returns it
const chatHistory = state.createDialogue("chatHistory");

// add messages directly
chatHistory.setUserMessage("Hey anyone there?");

// or retrieve from state later
state.getDialogue("chatHistory").setAssistantMessage("Yep! What's up?");
```

You can also create a standalone dialogue without state using `createDialogue`. See the [Dialogue](/state/dialogue.html) page for full details.

## Saving State

The `DefaultState` class implements `saveState()` with a warning log by default. To persist state, extend `DefaultState` and override it with your own save logic:

```ts
import { DefaultState } from "llm-exe";

class MyState extends DefaultState {
  async saveState() {
    const data = {
      dialogues: this.dialogues,
      attributes: this.attributes,
    };
    await db.save("state", JSON.stringify(data));
  }
}
```