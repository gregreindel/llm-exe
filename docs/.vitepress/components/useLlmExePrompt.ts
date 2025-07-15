import { ref, reactive, watch, nextTick, onMounted } from "vue";

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

  function getLlmExe() {
    if (typeof window === "undefined") return null;
    return (window as any)?.llmExe?.llmExe || null;
  }

  function generatePrompt(_type: string, _options: Record<string, any> = {}) {
    const llmExe = getLlmExe();
    if (!llmExe) return;

    prompt.value = llmExe.createPrompt(type.value, undefined, _options);

    nextTick(() => {
      if (prompt.value && messages.value.length) {
        for (const message of messages.value) {
          switch (message.role) {
            case "user":
              prompt.value.addToPrompt(message.content, "user", message.name);
              break;
            case "assistant":
              if (message.function_call) {
                // optionally handle function_call
              } else if (message.content) {
                prompt.value.addToPrompt(message.content, "assistant");
              }
              break;
            case "system":
              prompt.value.addToPrompt(message.content, "system");
              break;
            case "function":
              // handle function role if needed
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

  function initialize() {
    const llmExe = getLlmExe();
    if (!llmExe) {
      setTimeout(() => {
        console.log("llmExe not ready");
        initialize();
      }, 1000);
    } else {
      console.log("llmExe is ready");
      generatePrompt(type.value, options);
      ready.value = true;
    }
  }

  // Moved to onMounted to avoid SSR access
  onMounted(() => {
    initialize();
  });

  watch(messages, reset, { deep: true });
  watch(options, reset, { deep: true });
  watch(type, reset, { deep: true });

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
