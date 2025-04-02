<template>
  <div id="model-shorthand-container" class="info custom-block">
    <div class="custom-block-title custom-block-title-default">INFO</div>
    <div>You can use the following models using this shorthand:</div>
    <ul>
      <li v-for="model in models" :key="model">
        <code>{{ props.provider }}.{{ model }}</code>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import allModels from "../data/models.json";

const props = defineProps<{
  provider: string;
}>();

const providerInfo = allModels[props.provider];
const models = computed(() => (providerInfo ? providerInfo.models : []));
</script>
