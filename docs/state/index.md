# State

When calling an LLM from your code, the LLM only knows the history you provide it.

When using llm-exe, the state is something you need to manage. To help provide a concept of memory to your LLM's, we provide a simple state module. 

The state module consists of 3 concepts:
- **Dialogues** — conversation history for one or many LLM interactions
- **Context** — typed data items with their own lifecycle
- **Attributes** — simple key-value metadata

## Creating State

```ts
import { createState } from "llm-exe";

const state = createState();
```

`createState()` takes no arguments and returns a `DefaultState` instance.

## Dialogues

Dialogues store conversation history. You can have one or many dialogues on a single state, each identified by a unique name.

```ts
const state = createState();

// Create a new dialogue — returns the Dialogue instance
const chatHistory = state.createDialogue("chatHistory");

// Add messages directly
chatHistory.setUserMessage("Hey anyone there?");

// Retrieve from state later
state.getDialogue("chatHistory").setAssistantMessage("Yep! What's up?");
```

### Dialogue methods on state

| Method | Description |
|--------|-------------|
| `createDialogue(name)` | Create a new dialogue. Throws if name already exists. |
| `useDialogue(name)` | Get an existing dialogue or create it if it doesn't exist. |
| `getDialogue(name)` | Get an existing dialogue. Throws if not found. |

You can also create a standalone dialogue without state using `createDialogue`. See the [Dialogue](/state/dialogue.html) page for full details.

## Context

Context items are instances of `BaseStateItem` — typed classes with `getValue()`, `setValue()`, and `resetValue()` methods. Use context for structured, typed data that needs its own lifecycle (e.g., extracted entities, session config).

Create context items with `createStateItem(name, defaultValue)` and add them via `state.createContextItem(item)`.

```ts
import { createState, createStateItem } from "llm-exe";

const state = createState();

// Create a typed context item — default value is required
// and determines the allowed type for setValue()
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
`createStateItem(name, defaultValue)` requires a default value. The type of the default value determines what types `setValue()` accepts. Omitting the default value will cause a TypeScript error.
:::

### Context methods on state

| Method | Description |
|--------|-------------|
| `createContextItem(item)` | Add a `BaseStateItem` to the state. Throws if the key already exists. |
| `getContext<T>(key)` | Get a context item by key, typed as `BaseStateItem<T>`. |
| `getContextValue<T>(key)` | Get the current value of a context item directly. |

## Attributes

Attributes are a simple key-value store for lightweight metadata that doesn't need the structure of context items.

```ts
const state = createState();

state.setAttribute("language", "en");
state.setAttribute("sessionId", "abc-123");

state.attributes;             // { language: "en", sessionId: "abc-123" }
state.deleteAttribute("sessionId");
state.clearAttributes();      // removes all attributes
```

| Method | Description |
|--------|-------------|
| `setAttribute(key, value)` | Set an attribute. |
| `deleteAttribute(key)` | Remove a single attribute. |
| `clearAttributes()` | Remove all attributes. |

## Serialization

Use `state.serialize()` to get a plain-object snapshot of all dialogues, context, and attributes:

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