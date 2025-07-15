<template>
  <a class="back-to-examples" v-if="isExamplesSingle" href="/examples/"
    >Back to examples</a
  >
</template>

<script setup lang="ts">
import { useRoute } from "vitepress";
import { computed } from "vue";
const isExamplesSingle = computed(() => {
  return route.path.includes("/examples/") && route.path !== "/examples/";
});
const route = useRoute();
</script>
<style lang="css" scoped>
.back-to-examples {
  opacity: 0.5;
  font-size: 90%;
  display: block;
  margin-top: -20px;
  margin-bottom: 20px;
}

.back-to-examples:hover {
  color: var(--vp-c-brand-2);
}
.back-to-examples:active {
  color: yellow;
}
</style>
