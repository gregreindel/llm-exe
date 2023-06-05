# Dialogue
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