<template>
  <div v-if="ready" class="grid-wrap">
    <div class="grid-left-side">
      <div>
        <input type="checkbox" v-model="parseUserTemplates" />
      </div>

      <div>
        <div><button @click="createNewPrompt">Reset</button></div>
        <PromptMessage
          @update="handleMessageUpdate"
          v-for="(message, index) in messages"
          :message="message"
          :index="index"
        />
        <button @click="addUserMessage">Add user message</button>
        <button @click="addUserMessage">Add assistant message</button>
      </div>
      <div>
        <div><textarea v-model="json"></textarea></div>
      </div>
    </div>
    <div class="grid-right-side">
      <pre>{{ output }}</pre>
      <pre>{{ prompt }}</pre>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";

const ready = ref(false);

const json = ref(JSON.stringify({ type: "text", text: "Hello" }, null, 2));
const prompt = ref<any>((window as any)?.llmExe?.llmExe?.createPrompt("chat"));

const parseUserTemplates = ref(false);

const messages = computed(() => {
  if (!prompt.value) return "";
  return prompt.value.messages || [];
});

const output = computed(() => {
  if (!prompt.value) return "";
  let parsed = {};
  try {
    parsed = JSON.parse(json.value);
    return prompt.value.format(parsed);
  } catch (e) {
    return "";
  }
});

function createNewPrompt() {
  prompt.value = (window as any)?.llmExe?.llmExe?.createPrompt("chat");
  prompt?.value?.addUserMessage("Hellogg");
}

function addAssistantMessage() {
  prompt?.value?.addAssistantMessage("Hello");
}
function addUserMessage() {
  prompt?.value?.addUserMessage("Hello");
}

function addMessage(arg: any) {
  prompt?.value?.addToPrompt(arg.content, arg.role);
}

function handleMessageUpdate(data: any) {
  console.log("handleMessageUpdate", data);
  prompt.value.messages[data.index].content = data.content;
  prompt.value.messages[data.index].role = data.role;
}

onMounted(() => {
  ready.value = false;
  setTimeout(() => {
    ready.value = true;
    createNewPrompt();
  }, 200);
});
</script>
<style scoped>
.grid-wrap {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.grid-left-side {
  grid-column: 1;
}
.grid-right-side {
  grid-column: 2;
}
</style>
