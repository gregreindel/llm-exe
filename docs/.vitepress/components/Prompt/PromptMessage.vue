<template>
  <div class="message-outer">
    <div class="message-role-outer">
      <div class="message-label">Role</div>
      <div class="message-role" @click="toggleRole">{{ role }}</div>
    </div>

    <div class="message-content">
      <div class="message-label">Message</div>
      <div><textarea v-model="messageValue"></textarea></div>
      <!-- <button @click="addMessage">Add User Message</button> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watchEffect, onMounted, defineProps } from "vue";

const props = defineProps<{
  message: any;
  index: number;
}>();

const emit = defineEmits(["update"]);

const role = ref("user");
const messageValue = ref("");
const options = ["user", "assistant"];
function toggleRole() {
  role.value = options[(options.indexOf(role.value) + 1) % options.length];
}

function addMessage() {
  // emit("addMessage", { role: role.value, content: messageValue.value });
}

onMounted(() => {
  role.value = props.message.role;
  messageValue.value = props.message.content;
});


watchEffect(() => {
  try {
    emit("update", { role: role.value, content: messageValue.value, index: props.index });
  } catch (e) {
    console.error(e);
  }
});

</script>

<style scoped>
.message-outer {
  display: flex;
  border: 1px solid #efefef;
  padding:8px
}

.message-role {
  border: 1px solid #efefef;
  padding:8px
}

.message-role-outer {
  width: 100px;
}


.message-content {
  width:100% ;
  /* background:red; */
}

.message-content textarea {
  border: 1px solid #efefef;
  width:100% ;
  /* background:red; */
}

.message-label {
  font-size:13px;
  font-weight:600
}
</style>
