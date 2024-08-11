<template>
  <div class="dialogue-wrapper">
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
import { state } from "../../../build/examples/state";
import { h, ref, reactive, watchEffect } from "vue";

const props = defineProps<{
  example: string
}>();

const selected = ref(false);

const getExampleFromPath = get({state}, props.example, () => ({
  display: {}
}));

const { display } = getExampleFromPath()

</script>