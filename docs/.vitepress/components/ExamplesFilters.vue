<template>
  <div class="filter-row">
    <div v-if="values.length" @click="clearFilter" class="filter-item clear">
      clear filter
    </div>
    <div
      @click="setFilter(group.key)"
      class="filter-item"
      :class="{
        active: values.includes(group.key),
      }"
      v-for="group in allExamples.groups"
      :key="group.title"
    >
      {{ group.title }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import allExamples from "../data/examples.json";
import { ref } from "vue";

const values = ref<string[]>([]);

const emit = defineEmits(["change"]);

function clearFilter() {
  values.value = [];
  emit("change", values.value);
}
function setFilter(group: string) {
  if (values.value.includes(group)) {
    values.value = values.value.filter((item) => item !== group);
  } else {
    values.value.push(group);
  }
  emit("change", values.value);
}
</script>

<style lang="css" scoped>
.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;
  align-items: center;
}

.filter-item {
  padding: 2px 4px;
  font-size: 14px;
  border-radius: 4px;

  cursor: pointer;
  transition: all 0.3s ease;
}
.filter-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}
.filter-item.active {
  color: var(--vp-c-brand-2);
}
.filter-item:active,
.filter-item.active:active {
  color: yellow;
}
</style>
