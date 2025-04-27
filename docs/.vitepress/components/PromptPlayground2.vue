<template>
  <div v-if="ready" class="grid-wrap">
    <div class="grid-left-side">
      <div>
        <!-- <div><button @click="createNewPrompt">Reset</button></div> -->
        <!-- <PromptMessage
            v-for="(message, index) in messages"
            :message="message"
            :index="index"
          /> -->

        <!-- start add messages -->
        <div class="left-side-section" style="width: 100%; position: relative">
          <div class="input-label">Add Messages</div>
          <div style="width: 100%">
            <div>
              <select
                v-model="newMessage.role"
                style="width: 100%; padding: 3px 8px"
              >
                <option value="system">System</option>
                <option value="assistant">Assistant</option>
                <option value="user">User</option>
              </select>
            </div>
            <textarea
              style="width: 100%; padding: 3px 8px"
              v-model="newMessage.content"
            />
          </div>

          <button
            class="add-message-button"
            @click="addMessage"
            style="padding: 1px 4px; background: #333; width: 100%"
          >
            Add
          </button>
        </div>
        <!-- end add messages -->

        <!-- start options -->

        <div class="left-side-section">
          <div class="input-label">Options</div>

          <div>
            <span>Prompt Type: </span>
            <select v-model="type">
              <option value="chat">chat</option>
              <option value="text">text</option>
            </select>
          </div>
          <div>
            <span>Allow Unsafe User Template</span>:
            <input type="checkbox" v-model="options.allowUnsafeUserTemplate" />
          </div>
        </div>

        <!-- end options -->
      </div>
      <div>
        <div>
          <textarea
            style="width: 100%; padding: 3px 8px; min-height: 200px"
            v-model="json"
          ></textarea>
        </div>
      </div>
    </div>
    <div class="grid-right-side">
      <div class="tabs-labels">
        <div
          style="padding: 2px 3px; cursor: pointer"
          class="tabs-label"
          :class="activeTab === 'messages' ? 'active' : ''"
          @click="activeTab = 'messages'"
        >
          messages
        </div>
        <div
          style="padding: 2px 3px; cursor: pointer"
          class="tabs-label"
          :class="activeTab === 'options' ? 'active' : ''"
          @click="activeTab = 'options'"
        >
          options
        </div>
        <div
          style="padding: 2px 3px; cursor: pointer"
          class="tabs-label"
          :class="activeTab === 'prompt' ? 'active' : ''"
          @click="activeTab = 'prompt'"
        >
          prompt
        </div>
      </div>
      <div
        style="padding: 32px; border: 1px solid #333; background-color: black"
      >
        <pre v-if="activeTab === 'options'">{{ options }}</pre>
        <pre v-if="activeTab === 'messages'">{{ output }}</pre>
        <pre v-if="activeTab === 'prompt'">{{ prompt }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted, nextTick } from "vue";
import { useLlmExePrompt } from "./useLlmExePrompt";

const activeTab = ref("messages");

const data = {
  name: "Greg",
  person: {
    firstName: "Greg",
  },
};
const json = ref(JSON.stringify(data, null, 2));

const newMessage = ref({
  content: "",
  role: "user",
});

function addMessage() {
  const message = {
    content: newMessage.value.content,
    role: newMessage.value.role,
  };

  add(newMessage.value.role, newMessage.value.content);

  newMessage.value.content = "";

  if (message?.role === "system") {
    newMessage.value.role = "user";
  } else {
    newMessage.value.role = message?.role || "user";
  }
}

const { ready, prompt, options, type, add, reset } = useLlmExePrompt();

const messages = computed(() => {
  if (!prompt.value) return [];
  return prompt.value.messages || [];
});

const output = computed(() => {
  if (!prompt.value) return "";
  let parsed = {};
  try {
    parsed = JSON.parse(json.value);

    console.log("hellooooo", parsed);
    return prompt.value.format(parsed);
  } catch (e) {
    console.log("errr");
    return "";
  }
});

// onMounted(() => {
//   ready.value = false;
//   setTimeout(() => {
//     reset()
//     ready.value = true;
//     console.log("ready", prompt);
//     //   createNewPrompt();
//   }, 500);
// });
</script>
<style scoped>
.grid-wrap {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.grid-left-side {
  grid-column: 1;
  margin-right: 60px;
}
.grid-right-side {
  grid-column: 2;
}

.left-side-section {
  margin-bottom: 30px;
}

.input-label {
  font-weight: bold;
  font-size: 14px;
}

.tabs-labels {
  display: flex;
  justify-content: flex-end;
}

.tabs-label {
  opacity: 0.5;
}

.tabs-label:hover {
  opacity: 0.8;
}

.tabs-label.active {
  background-color: #333;
  opacity: 1;
  color: white;
}
</style>
