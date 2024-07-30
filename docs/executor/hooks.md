## LLM Executor Hooks

Hooks are available mostly for logging purposes, but can have more advanced use-cases. Hooks are functions you can define which get called at certain stages of the execution. Hooks are optional, and you can register more than one function per hook (meaning there can be many functions listening on the same hook).

The following hooks are available:

- onComplete
- onSuccess
- onError

You can attach hooks:

- During initialization
- After initialization using on/off/once

#### Adding hooks during initialization:

```typescript{2,5}:no-line-numbers
// You can pass in hooks object
const hooks = { onComplete: logFunction, onError: logFunctionError };
const llm = createLlmV3("openai.mock", {});
const prompt = createChatPrompt("This is a prompt.");
const executor = new LlmExecutor({ llm, prompt }, { hooks });
```

#### Adding hooks after initialization:

```typescript{13,14}:no-line-numbers
function logFunction() {
  console.log("its done!!");
}

function logFunctionError() {
  console.log("its done!!");
}

// You can also use on to listen
const llm = createLlmV3("openai.mock", {});
const prompt = createChatPrompt("This is a prompt.");
const executor = new LlmExecutor({ llm, prompt });
executor.on("onComplete", logFunction);
executor.on("onError", logFunctionError);
return executor.execute({});
```

You can also use `.once` to add a hook that get executed exactly once

```typescript{5}:no-line-numbers
// You can also use once to listen once
const llm = createLlmV3("openai.mock", {});
const prompt = createChatPrompt("This is a prompt.");
const executor = new LlmExecutor({ llm, prompt });
executor.once("onComplete", logFunction);
return executor.execute({});
```

::: tip
Default behavior is to not add the same handler to the same hook more than once.
:::
