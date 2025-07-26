<template>
  <div class="VPImage hero-code-container vp-adaptive-theme">
    <div class="hero-code-wrapper">
      <ModelCodeSwitcher
        :code="code"
        :provider-models="providerModels"
        language="typescript"
        class="vp-code-block-hero"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const code = `import { createLlmExecutor, useLlm, createParser } from "llm-exe";

const classifier = createLlmExecutor({
  llm: useLlm("\${provider}.\${model}"),
  prompt: "Classify as bug/feature/question: {{text}}",
  parser: createParser("enum", {
    values: ["bug", "feature", "question"]
  })
});

// Type-safe, reliable, production-ready ✨
const category = await classifier.execute({ text: userInput });`;

import { getProviders } from "../../utils/modelSwitcher";
const providerModels = getProviders();
</script>

<style scoped>
.hero-code-container {
  width: 95%;
  max-width: 600px;
}

.hero-code-container :deep(.switcher-root) {
  margin: 0;
  background: var(--vp-code-block-bg);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  max-height: 400px !important;
  min-height: auto !important;
}

.hero-code-container :deep(.code-block code span) {
  font-family: inherit;
  display: inline-block !important;
  height: auto !important;
  line-height: 1.4 !important;
  vertical-align: baseline !important;
  margin: 0 !important;
  padding: 0 !important;
}

.hero-code-container :deep(.code-block span[class*="line"]) {
  min-height: auto !important;
  height: auto !important;
  display: block;
  padding: 0 !important;
  margin: 0 !important;
  margin-bottom: 4px !important;
  line-height: 1.4 !important;
  white-space: pre !important;
  overflow: visible !important;
}

@media (max-width: 640px) {
  .hero-code-wrapper {
    width: 100vw !important;
    position: static !important;
  }

  .hero-code-container :deep(.provider-tabs::-webkit-scrollbar) {
    display: none;
  }

  .hero-code-container :deep(.provider-tab) {
    flex: 0 0 auto;
    min-width: 100px;
  }
}
</style>
