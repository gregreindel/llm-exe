## Callable Executor Wrapper

If you want an LLM to call other 'tools' or functions, then we provide a simple wrapper to assist. 

```typescript:no-line-numbers
const executors = useExecutors([
  finalAnswerCallable,
  interactWithUserCallable,
  searchInternetCallable,
  takeNotesCallable,
]);

const functionWithCallableExecutors = async (input: {
  action: string;
  input: string;
  thought: string;
}) => {
  return executors.callFunction(input.action, input.input);
};

```