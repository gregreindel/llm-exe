# State

When calling an LLM from your code, the LLM only knows the history you provide it.

When using llm-exe, the state is something you need to manage. To help provide a concept of memory to your LLM's, we provide a simple state module. 

The state module consists of 3 concepts:
- Dialogues
- Context
- Attributes

Dialogues are a place to store conversation history, internal dialogues, really any conversation that is taking place with an LLM. You can have one or many dialogues. When you create a new dialogue, you should provide a key, which allows you to access the dialogue from the state later if needed.

**Context** items are instances of `BaseStateItem` — typed classes with `getValue()`, `setValue()`, and `resetValue()` methods. Use context for structured, typed data that needs its own lifecycle (e.g., extracted entities, session config). Create context items with `createStateItem(name, defaultValue)` and add them via `state.createContextItem(item)`.

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

You can also retrieve context items from the state later:

```ts
// Get the item itself
const item = state.getContext<string>("userIntent");
item.getValue(); // "booking"

// Or get just the value directly
const value = state.getContextValue<string>("userIntent"); // "booking"
```

**Attributes** are a simple key-value store for lightweight metadata.

| Method | Description |
|--------|-------------|
| `setAttribute(key, value)` | Set an attribute. |
| `deleteAttribute(key)` | Remove a single attribute. |
| `clearAttributes()` | Remove all attributes. |

```ts
state.setAttribute("userId", "abc-123");
state.attributes.userId; // "abc-123"

state.deleteAttribute("userId");
state.clearAttributes();
```

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

### Dialogue methods

| Method | Description |
|--------|-------------|
| `createDialogue(name?)` | Creates a new dialogue. Throws if one with that name already exists. Defaults to `"defaultDialogue"`. |
| `useDialogue(name?)` | Gets an existing dialogue or creates one if it doesn't exist. Use this when you don't need to enforce uniqueness. |
| `getDialogue(name?)` | Gets an existing dialogue. Throws if it doesn't exist. |

```ts
// useDialogue is safe to call multiple times — it won't throw
const d = state.useDialogue("chat");
```

You can also create a standalone dialogue without state using `createDialogue`. See the [Dialogue](/state/dialogue.html) page for full details.

## Serialization

Call `state.serialize()` to get a plain object snapshot of all dialogues, context items, and attributes:

```ts
const snapshot = state.serialize();
// { dialogues: { ... }, context: { ... }, attributes: { ... } }
```

## Saving State

The `DefaultState` class implements `saveState()` with a warning log by default. To persist state, extend `DefaultState` and override it with your own save logic:

```ts
import { DefaultState } from "llm-exe";

class MyState extends DefaultState {
  async saveState() {
    const snapshot = this.serialize();
    await db.save("state", JSON.stringify(snapshot));
  }
}
```