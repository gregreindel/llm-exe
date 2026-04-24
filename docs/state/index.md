# State

When calling an LLM from your code, the LLM only knows the history you provide it.

When using llm-exe, the state is something you need to manage. To help provide a concept of memory to your LLM's, we provide a simple state module. 

The state module consists of 3 concepts:
- **Dialogues** — conversation history for multi-turn LLM interactions
- **Context** — typed, structured data with its own lifecycle
- **Attributes** — simple key-value metadata store

## Creating State

```ts
import { createState } from "llm-exe";

const state = createState();
```

`createState()` takes no arguments. It returns a `DefaultState` instance.

## API Reference

| Method | Returns | Description |
|--------|---------|-------------|
| `createDialogue(name)` | `Dialogue` | Create a named dialogue and add it to state. |
| `getDialogue(name?)` | `Dialogue` | Retrieve a dialogue by name. Defaults to `"defaultDialogue"`. Throws if not found. |
| `createContextItem(item)` | `BaseStateItem` | Add a context item to state. Throws if a context item with the same name already exists. |
| `getContext(key)` | `BaseStateItem` | Retrieve a context item by name. |
| `getContextValue(key)` | `T` | Get the current value of a context item directly. |
| `setAttribute(key, value)` | `void` | Set an attribute. |
| `deleteAttribute(key)` | `void` | Delete an attribute. |
| `clearAttributes()` | `void` | Remove all attributes. |
| `saveState()` | `Promise<void>` | Override in subclasses to persist state. Default logs a warning. |

## Dialogues

Dialogues store conversation history. Create one on the state, then add messages:

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

## Context

Context items are instances of `BaseStateItem` — typed classes with `getValue()`, `setValue()`, and `resetValue()` methods. Use context for structured, typed data that needs its own lifecycle (e.g., extracted entities, session config).

Create context items with `createStateItem(name, defaultValue)` and add them via `state.createContextItem(item)`.

::: warning
`createStateItem` requires a default value, and `setValue()` enforces the same type as the default. If you omit the default (leaving it `undefined`), you won't be able to set a value later. Always pass a default of the type you intend to store.
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

// Retrieve from state later
state.getContextValue<string>("userIntent"); // "booking"
```

## Attributes

Attributes are a simple key-value store for lightweight metadata:

```ts
const state = createState();

state.setAttribute("userId", "abc-123");
state.setAttribute("locale", "en-US");

state.attributes;               // { userId: "abc-123", locale: "en-US" }
state.deleteAttribute("locale");
state.clearAttributes();        // removes all attributes
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