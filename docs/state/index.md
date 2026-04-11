# State

When calling an LLM from your code, the LLM only knows the history you provide it.

When using llm-exe, the state is something you need to manage. To help provide a concept of memory to your LLM's, we provide a simple state module.

## Quick Start

```ts
import { createState, createStateItem, createDialogue } from "llm-exe";

// Create a state container
const state = createState();

// Add a dialogue to track conversation history
const chat = state.createDialogue("chat");
chat.setUserMessage("Hello!");
chat.setAssistantMessage("Hi there!");

// Add typed context items for structured data
const intent = createStateItem("intent", "unknown");
state.createContextItem(intent);
intent.setValue("booking");

// Use attributes for simple key-value metadata
state.setAttribute("sessionId", "abc-123");
```

The state module consists of 3 concepts:
- **Dialogues** — conversation history for LLM interactions
- **Context** — typed state items with their own lifecycle
- **Attributes** — simple key-value metadata store

## API Reference

### `createState()`

Creates a new state instance. Takes no arguments.

```ts
import { createState } from "llm-exe";

const state = createState();
```

**Returns:** `DefaultState` — a state container with the following methods:

| Method | Description |
|--------|-------------|
| `createDialogue(name)` | Create a new dialogue and attach it to the state. Returns the `Dialogue`. |
| `useDialogue(name, dialogue)` | Attach an existing `Dialogue` instance to the state under `name`. |
| `getDialogue(name)` | Retrieve a dialogue by name. |
| `createContextItem(item)` | Add a `StateItem` (created via `createStateItem`) to the state. |
| `setAttribute(key, value)` | Set a key-value attribute. |
| `deleteAttribute(key)` | Remove an attribute by key. |
| `clearAttributes()` | Remove all attributes. |
| `serialize()` | Serialize the state (dialogues, context, attributes) to a plain object. |
| `saveState()` | Persist the state. Override this in a subclass — the default logs a warning. |

### `createStateItem(name, defaultValue)`

Creates a typed state item for use as a context item in state. The type parameter is inferred from the default value.

```ts
import { createStateItem } from "llm-exe";

const counter = createStateItem("counter", 0);
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | `string` | A unique identifier for this state item. |
| `defaultValue` | `T` | The initial value. Also determines the allowed type for future `setValue` calls. |

::: warning
Always provide a default value of the type you intend to store. If you omit the default (leaving it `undefined`), subsequent `setValue` calls will fail because the type check expects `undefined`.
:::

**Returns:** `DefaultStateItem<T>` with these methods:

| Method | Description |
|--------|-------------|
| `getValue()` | Get the current value (typed as `T`). |
| `setValue(value)` | Set a new value. Must match the type of `defaultValue`. |
| `getKey()` | Get the item's name. |
| `resetValue()` | Reset to the original default value. |
| `serialize()` | Serialize the item to a plain object. |

**Example:**

```ts
const userIntent = createStateItem("userIntent", "unknown");

userIntent.getValue();    // "unknown"
userIntent.setValue("booking");
userIntent.getValue();    // "booking"
userIntent.resetValue();
userIntent.getValue();    // "unknown"
```

### `createDialogue(name)`

Creates a standalone dialogue for managing conversation history. Can be used independently or attached to state.

```ts
import { createDialogue } from "llm-exe";

const dialogue = createDialogue("chat");
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | `string` | A name for this dialogue. |

**Returns:** `Dialogue` — see the [Dialogue](/state/dialogue.html) page for full details on message methods.

## Dialogues

Dialogues store conversation history. You can create them as part of state or standalone.

**On state:**

```ts
const state = createState();

// Creates a new dialogue in the state and returns it
const chatHistory = state.createDialogue("chatHistory");

// Add messages directly
chatHistory.setUserMessage("Hey anyone there?");

// Or retrieve from state later
state.getDialogue("chatHistory").setAssistantMessage("Yep! What's up?");
```

**Standalone:**

```ts
import { createDialogue } from "llm-exe";

const dialogue = createDialogue("myDialogue");
dialogue.setUserMessage("Hello!");
dialogue.setAssistantMessage("Hi! How can I help?");

// Get the message history
const messages = dialogue.getHistory();
```

See the [Dialogue](/state/dialogue.html) page for the complete API including tool calls, loading history, and adding LLM output.

## Context Items

Context items are typed, named values for structured data that needs its own lifecycle (e.g., extracted entities, session config). Create them with `createStateItem` and add them to state with `createContextItem`.

```ts
import { createState, createStateItem } from "llm-exe";

const state = createState();

const userIntent = createStateItem("userIntent", "unknown");
state.createContextItem(userIntent);

// Use getValue/setValue to manage the item
userIntent.getValue();    // "unknown"
userIntent.setValue("booking");
userIntent.getValue();    // "booking"
userIntent.resetValue();  // resets to "unknown"
```

## Attributes

Attributes are a simple key-value store for lightweight metadata that doesn't need typed lifecycle management.

```ts
const state = createState();

state.setAttribute("sessionId", "abc-123");
state.setAttribute("language", "en");

state.deleteAttribute("language");
state.clearAttributes();
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