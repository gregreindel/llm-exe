---
title: Examples | Build Typed, Modular LLM Functions with llm-exe
description: "Hands-on examples for building structured LLM applications in TypeScript. Learn how to compose executors for intent detection, slot extraction, validation, and more—using strongly typed prompts, parsers, and state."
---

# Examples

<ExamplesFilters @change="changeFilters" />
<ExamplesBlocks :filter-group="filters" />

<script setup lang="ts">
import { ref } from 'vue'

const filters = ref([]);

function changeFilters(_filters: string[]){
    filters.value = _filters;
}

</script>
