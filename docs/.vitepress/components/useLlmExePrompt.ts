import { ref, reactive, watch, nextTick } from "vue";

export function useLlmExePrompt() {
  const ready = ref(false);

  const prompt = ref<any>(null);
  const type = ref("chat");
  const messages = ref<
    { role: string; content: string; name?: string; function_call?: any }[]
  >([]);

  const options = reactive({
    allowUnsafeUserTemplate: false,
  });

  function generatePrompt(_type: string, _options: Record<string, any> = {}) {
    prompt.value = getLlmExe().createPrompt(type.value, undefined, _options);
    nextTick(() => {
      if (prompt.value && messages.value.length) {
        //   ;(prompt.value as any).addFromHistory(existingMessages);
        for (const message of messages.value) {
          console.log("adding back", message);
          switch (message.role) {
            case "user":
              (prompt.value as any).addToPrompt(
                message.content,
                "user",
                message?.name
              );
              break;
            case "assistant":
              if (message.function_call) {
                //   this.addFunctionCallMessage(message.function_call);
              } else if (message?.content) {
                (prompt.value as any).addToPrompt(
                  message?.content,
                  "assistant"
                );
              }
              break;
            case "system":
              (prompt.value as any).addToPrompt(message.content, "system");
              break;
            case "function":
              // this.addFunctionMessage(message.content, message.name);
              break;
          }
        }
      }

    });
  }

  function reset() {
    generatePrompt(type.value, options);
  }

  function add(role: string, content: string, name?: string) {
    if (prompt.value) {
      messages.value.push({ role, content, name });
      prompt.value.addToPrompt(content, role, name);
    }
  }

  function getLlmExe() {
    const llmExe = (window as any)?.llmExe?.llmExe!;
    return llmExe;
  }

  watch(messages, reset, { deep: true });
  watch(options, reset, { deep: true });
  watch(type, reset, { deep: true });

  function intialize() {
    ready.value = false;
    const llmExe = getLlmExe();
    if (!llmExe) {
      setTimeout(() => {
        console.log("llmExe not read");
        intialize();
      }, 1000);
    } else {
      console.log("llmExe is read");
      generatePrompt(type.value, options);
      ready.value = true;
    }
  }

  intialize();

  return {
    ready,
    reset,
    prompt,
    type,
    options,
    add,
    generatePrompt,
  };
}
