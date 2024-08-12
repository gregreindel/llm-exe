<template>
  <div class="message-outer">
    <div class="message-role">
      <div>Role</div>
      <div @click="toggleRole">{{ role }}</div>
    </div>

    <div class="message-content">
      <div>Message</div>
      <div><textarea v-model="message"></textarea></div>
      <button @click="addMessage">Add User Message</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, defineProps } from "vue";

defineProps<{
  message: any;
  index: number;
}>();

const emit = defineEmits(["addMessage"]);

const role = ref("user");
const message = ref("Hello");
const options = ["user", "assistant"];
function toggleRole() {
  role.value = options[(options.indexOf(role.value) + 1) % options.length];
}

function addMessage() {
  emit("addMessage", { role: role.value, content: message.value });
}
</script>

<style scoped>
.message-outer {
  display: flex;
}

.message-role {
    width: 100px;
}
</style>
