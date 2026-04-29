# State

When calling an LLM from your code, the LLM only knows the history you provide it.

When using llm-exe, the state is something you need to manage. To help provide a concept of memory to your LLM's, we provide a simple state module. 

The state module consists of 3 concepts:
- **Dialogues** — conversation history for multi-turn interactions
- **Context** — typed, named data items with lifecycle methods
- **Attributes** — simple key-value store for lightweight metadata

## Creating State

```ts
import { createState } from "llm-exe";

const state = createState();
```

`createState()` takes no arguments and returns a `DefaultState` instance.

## Dialogues

Dialogues store conversation history. You can have one or many dialogues. Each dialogue has a unique name key.

```ts
const state = createState();

// Create a new dialogue (throws if name already exists)
const chatHistory = state.createDialogue("chatHistory");

// Add messages directly
chatHistory.setUserMessage("Hey anyone there?");

// Retrieve from state later
state.getDialogue("chatHistory").setAssistantMessage("Yep! What's up?");
```

### Dialogue methods on state

| Method | Description |
|--------|-------------|
| `createDialogue(name)` | Create a new dialogue. Throws if the name already exists. |
| `useDialogue(name)` | Get an existing dialogue or create one if it doesn't exist. |
| `getDialogue(name)` | Get an existing dialogue. Throws if it doesn't exist. |

You can also create a standalone dialogue without state using `createDialogue`. See the [Dialogue](/state/dialogue.html) page for full details.

## Context

Context items are instances of `BaseStateItem` — typed classes with `getValue()`, `setValue()`, and `resetValue()` methods. Use context for structured, typed data that needs its own lifecycle (e.g., extracted entities, session config).

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

::: warning
`createStateItem` requires a default value that establishes the item's type. The type of all future `setValue()` calls must match `typeof defaultValue`.
:::

### Context methods on state

| Method | Description |
|--------|-------------|
| `createContextItem(item)` | Register a `BaseStateItem` on the state. Throws if the key already exists. |
| `getContext(key)` | Get a context item by key (returns the `BaseStateItem` instance). |
| `getContextValue(key)` | Get the current value of a context item directly. |

### StateItem methods

| Method | Description |
|--------|-------------|
| `getValue()` | Get the current value. |
| `setValue(value)` | Set a new value (must match the type of the default value). |
| `resetValue()` | Reset to the initial default value. |
| `getKey()` | Get the item's name/key. |

## Attributes

Attributes are a simple key-value store for lightweight metadata that doesn't need the structure of context items.

```ts
const state = createState();

state.setAttribute("language", "en");
state.setAttribute("userId", "abc123");

state.attributes;  // { language: "en", userId: "abc123" }

state.deleteAttribute("userId");
state.clearAttributes();  // removes all attributes
```

| Method | Description |
|--------|-------------|
| `setAttribute(key, value)` | Set an attribute. |
| `deleteAttribute(key)` | Remove a single attribute. |
| `clearAttributes()` | Remove all attributes. |

## Serialization

State can be serialized for persistence:

```ts
const data = state.serialize();
// { dialogues: {...}, context: {...}, attributes: {...} }
```

## Saving State

The `DefaultState` class implements `saveState()` with a warning log by default. To persist state, extend `DefaultState` and override it with your own save logic:

```ts
import { DefaultState } from "llm-exe";

class MyState extends DefaultState {
  async saveState() {
    const data = this.serialize();
    await db.save("state", JSON.stringify(data));
  }
}
```