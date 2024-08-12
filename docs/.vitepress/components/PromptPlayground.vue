<template>
  <div>
    <!-- <pre>{{ prompt }}</pre> -->
    <div><button @click="createNewPrompt">Reset</button></div>
    <PromptMessage @addMessage="addMessage" v-for="(message, index) in messages" :message="message" :index="index" />
    <PromptMessage v-if="messages.length === 0" @addMessage="addMessage" />

    <div><textarea v-model="json"></textarea></div>
    <pre>{{ output }}</pre>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";

const json = ref(JSON.stringify({ type: "text", text: "Hello" }, null, 2));
const prompt = ref<any>((window as any)?.llmExe?.llmExe?.createPrompt("chat"));

const messages = computed(() => {
  if (!prompt.value) return "";
  return prompt.value.messages || []
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
  // prompt.addMessage("user"    , "Hello")
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

onMounted(() => {
  createNewPrompt();
});
</script>
