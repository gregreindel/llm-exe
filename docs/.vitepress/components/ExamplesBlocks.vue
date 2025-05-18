<template>
  <div v-if="examples && examples.length" class="examples-blocks">
    <ExamplesBlock
      v-for="example in examples"
      :key="example.path"
      class="info custom-block example-link"
      :example="example"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import allExamples from "../data/examples.json";
const props = defineProps({
  filterGroup: {
    type: Array,
    required: true,
  },
});
const examples = computed(() => {
  let filtered = [...allExamples.examples];
  if (props?.filterGroup && props.filterGroup.length > 0) {
    filtered = filtered.filter((example) => {
      return props.filterGroup.includes(example.group);
    });
  }
  return filtered;
});
</script>

<style>
.examples-blocks {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: space-between;
}

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

@media screen and (max-width: 768px) {
  .custom-block.example-link {
    max-width: 100%;
  }
  .examples-blocks {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
