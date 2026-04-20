# State

When calling an LLM from your code, the LLM only knows the history you provide it.

When using llm-exe, the state is something you need to manage. To help provide a concept of memory to your LLM's, we provide a simple state module. 

## API Overview

The state module exports the following:

| Export | Description |
|--------|-------------|
| `createState()` | Create a new state instance (no arguments) |
| `createStateItem(name, defaultValue)` | Create a typed context item |
| `createDialogue(name)` | Create a standalone dialogue |
| `DefaultState` | The state class — extend it to customize persistence |
| `BaseStateItem` | Abstract base class for context items — extend for custom item types |
| `DefaultStateItem` | Default context item implementation used by `createStateItem` |

The state module consists of 3 concepts:
- **Dialogues** — conversation history for multi-turn LLM interactions
- **Context** — typed, structured data items with lifecycle management
- **Attributes** — simple key-value metadata store

## Creating State

Initializing a state object is simple. `createState()` takes no arguments:
```ts
import { createState } from "llm-exe";

const state = createState();
```

## Dialogues

Dialogues are a place to store conversation history, internal dialogues, really any conversation that is taking place with an LLM. You can have one or many dialogues. When you create a new dialogue, you should provide a key, which allows you to access the dialogue from the state later if needed.

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

## Context Items

Context items are instances of `BaseStateItem` — typed classes with `getValue()`, `setValue()`, and `resetValue()` methods. Use context for structured, typed data that needs its own lifecycle (e.g., extracted entities, session config). Create context items with `createStateItem(name, defaultValue)` and add them via `state.createContextItem(item)`.

::: warning
Always provide a default value that matches the type you intend to store. The `defaultValue` establishes the type — `setValue()` will reject values of a different type at runtime.
:::

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

### Retrieving Context

```ts
// Retrieve a context item from state by name
const intent = state.getContext("userIntent");
intent.getValue(); // "booking"
```

### Context Item Methods

| Method | Description |
|--------|-------------|
| `getValue()` | Get the current value |
| `setValue(value)` | Set a new value (must match the type of `defaultValue`) |
| `resetValue()` | Reset to the original default value |
| `getKey()` | Get the item's name |
| `serializeValue()` | Get `{ [key]: value }` for serialization |

## Attributes

Attributes are a simple key-value store for lightweight metadata. Unlike context items, they are untyped and don't have lifecycle methods.

```ts
const state = createState();

state.setAttribute("userId", "abc-123");
state.setAttribute("language", "en");

state.attributes;                // { userId: "abc-123", language: "en" }
state.deleteAttribute("language");
state.clearAttributes();         // removes all attributes
```

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