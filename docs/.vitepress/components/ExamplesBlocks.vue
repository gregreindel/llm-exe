<template>
  <div
    v-if="examples && examples.length"
    style="display: flex; flex-wrap: wrap; gap: 8px"
  >
    <ExamplesBlock
      v-for="example in examples"
      :key="example.path"
      class="info custom-block example-link"
      :example="example"
    />
  </div>
</template>

<script setup lang="ts">
import allExamples from "../data/examples.json";
const prompts = defineProps({
  category: {
    type: String,
    required: true,
  },
});
const examples = allExamples.examples.filter(
  (example) => example.group === prompts.category
);
</script>

<style>
.custom-block.example-link {
  width: 100%;
  max-width: 48%;
  padding: 22px 16px;
  cursor: pointer;
  border: 1px solid #fff;
  transition: all 0.3s ease;
}
.custom-block.example-link:hover {
  border-color: yellow;
  background: #111113;
}
</style>
