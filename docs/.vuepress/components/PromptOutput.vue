<template>
  <div class="prompt-wrapper">
    <div>
      <slot> </slot>
    </div>
    <div class="line"></div>

    <div
      v-if="!selected"
      class="log-area language-typescript"
      data-ext="console.log"
    >
      <pre><code class="log-output">{{ display }}</code></pre>
    </div>
    <div @click="selected = !selected" class="show-more-link">
      <span>{{ selected ? "Show Log" : "Hide Log" }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { get } from "../../../dist/utils";
import { createPrompt } from "../../../dist/prompt";
import { prompt as promptExamples } from "../../../build/examples/prompt/index";
import { ref, reactive } from "vue";

const props = defineProps<{
  example: string
}>();

const selected = ref(false);

const example = get({prompt: promptExamples}, props.example, () => ({
  prompt: createPrompt(),
  format: {},
  display: {}
}));

const { display } = example()
</script>

<style>
.log-area {
  background:#1b1e23!important;
}
code.log-output {
  color:#acb7c9!important;
}
.line {
  position: relative;
}

.line::before {
  content: "";
  background: #282c34;
  position: absolute;
  width: 8px;
  height: 14px;
  left: calc(50% - 4px);
  top: -13px;
}

.show-more-link {
  font-size: 11px;
  letter-spacing: 0.3px;
  text-align: right;
  margin-right:8px;
  margin-top: -40px;
  margin-bottom:40px;
  z-index: 1;
  position: relative;
}

.show-more-link span {
  background: #242424;
  padding: 4px 18px;
  border-radius: 8px;
  cursor: pointer;
  opacity:0.5;
}


.show-more-link span:hover {
  opacity:1;
}
</style>
