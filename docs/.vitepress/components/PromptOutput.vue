<template>
  <div class="prompt-wrapper">
    <div>
      <slot> </slot>
    </div>
    <div class="line-class"></div>

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
import { get } from "../../../build/src/utils/modules/get";
import { prompt as promptExamples } from "../../../build/examples/prompt";
import { ref, reactive } from "vue";

const props = defineProps<{
  example: string;
}>();

const selected = ref(false);

function getExampleFromPath() {
  return {
    prompt: {},
    format: {},
    display: {},
  };
}

const example = get({ prompt: promptExamples }, props.example, () => ({
  prompt: {},
  format: {},
  display: {},
}));

const { display } = example();
</script>

<style>
.log-area {
  background: #0f0f11ed !important;
  margin-left:30px!important;
  position: relative;
  overflow-x: visible!important;;
}

.log-area::before {
  background: #f6f6f7 !important;
  width:2px;
  height:25%;
  left:-8px;
  top:-16px;
  content: "";
  position: absolute;
  display:block;
}
.log-area::after {
  background: #f6f6f7 !important;
  width:8px;
  height:2px;
  left:-8px;
  top:19%;
  top:calc(25% - 16px);
  content: "";
  position: absolute;
  display:block;
}

.dark .log-area::before,
.dark .log-area::after {
  background: #161618 !important;
  background: linear-gradient(0deg, #0f0f11ed 0%, #161618 80%,  #161618 100%) !important;
}


code.log-output {
  color: #acb7c9 !important;
}
/* .line-class {
  position: relative;
}

.line-class::before {
  content: "";
  background: #282c34;
  position: absolute;
  width: 8px;
  height: 14px;
  left: calc(50% - 4px);
  top: -13px;
} */

.show-more-link {
  font-size: 11px;
  letter-spacing: 0.3px;
  text-align: right;
  margin-right: 8px;
  margin-top: -40px;
  margin-bottom: 40px;
  z-index: 1;
  position: relative;
}

.show-more-link span {
  background: #242424;
  padding: 4px 18px;
  border-radius: 1px;
  cursor: pointer;
  opacity: 0.5;
}

.show-more-link span:hover {
  opacity: 1;
}
</style>
