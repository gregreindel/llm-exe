<template>
  <a :href="example.path" style="display: block; text-decoration: none">
    <div style="font-size: 21px; font-weight: bold; margin-bottom: 4px">
      {{ example.title }}
    </div>
    <div style="">{{ example.description }}</div>
    <div style="display: flex; column-gap: 4px; margin-top: 8px">
      <div class="example-tag">{{ example.level }}</div>
      <div v-for="tag in example.tags" :key="tag" class="example-tag">
        {{ tag }}
      </div>
    </div>
  </a>
</template>

<script setup lang="ts">
defineProps({
  example: {
    type: Object,
    required: true,
  },
});
</script>

<style>
.example-tag {
  padding: 2px 4px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  font-size: 12px;
}
</style>
