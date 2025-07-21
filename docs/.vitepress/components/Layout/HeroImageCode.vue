<template>
  <div class="VPImage hero-code-container">
    <div class="language-typescript vp-adaptive-theme">
      <button title="Copy Code" class="copy" @click="copyCode"></button>
      <pre class="shiki shiki-themes github-light-default github-dark-default vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light: #CF222E; --shiki-dark: #FF7B72;">import</span><span style="--shiki-light: #1F2328; --shiki-dark: #E6EDF3;"> { createLlmExecutor, useLlm, createParser } </span><span style="--shiki-light: #CF222E; --shiki-dark: #FF7B72;">from</span><span style="--shiki-light: #032F62; --shiki-dark: #A5D6FF;"> "llm-exe"</span><span style="--shiki-light: #1F2328; --shiki-dark: #E6EDF3;">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light: #CF222E; --shiki-dark: #FF7B72;">const</span><span style="--shiki-light: #0550AE; --shiki-dark: #79C0FF;"> classifier</span><span style="--shiki-light: #CF222E; --shiki-dark: #FF7B72;"> =</span><span style="--shiki-light: #8250DF; --shiki-dark: #D2A8FF;"> createLlmExecutor</span><span style="--shiki-light: #1F2328; --shiki-dark: #E6EDF3;">({</span></span>
<span class="line"><span style="--shiki-light: #1F2328; --shiki-dark: #E6EDF3;">  llm: </span><span style="--shiki-light: #8250DF; --shiki-dark: #D2A8FF;">useLlm</span><span style="--shiki-light: #1F2328; --shiki-dark: #E6EDF3;">(</span><span style="--shiki-light: #032F62; --shiki-dark: #A5D6FF;">"openai.gpt-4o-mini"</span><span style="--shiki-light: #1F2328; --shiki-dark: #E6EDF3;">),</span></span>
<span class="line"><span style="--shiki-light: #1F2328; --shiki-dark: #E6EDF3;">  prompt: </span><span style="--shiki-light: #032F62; --shiki-dark: #A5D6FF;">"Classify as bug/feature/question: {{text}}"</span><span style="--shiki-light: #1F2328; --shiki-dark: #E6EDF3;">,</span></span>
<span class="line"><span style="--shiki-light: #1F2328; --shiki-dark: #E6EDF3;">  parser: </span><span style="--shiki-light: #8250DF; --shiki-dark: #D2A8FF;">createParser</span><span style="--shiki-light: #1F2328; --shiki-dark: #E6EDF3;">(</span><span style="--shiki-light: #032F62; --shiki-dark: #A5D6FF;">"enum"</span><span style="--shiki-light: #1F2328; --shiki-dark: #E6EDF3;">, {</span></span>
<span class="line"><span style="--shiki-light: #1F2328; --shiki-dark: #E6EDF3;">    values: [</span><span style="--shiki-light: #032F62; --shiki-dark: #A5D6FF;">"bug"</span><span style="--shiki-light: #1F2328; --shiki-dark: #E6EDF3;">, </span><span style="--shiki-light: #032F62; --shiki-dark: #A5D6FF;">"feature"</span><span style="--shiki-light: #1F2328; --shiki-dark: #E6EDF3;">, </span><span style="--shiki-light: #032F62; --shiki-dark: #A5D6FF;">"question"</span><span style="--shiki-light: #1F2328; --shiki-dark: #E6EDF3;">]</span></span>
<span class="line"><span style="--shiki-light: #1F2328; --shiki-dark: #E6EDF3;">  })</span></span>
<span class="line"><span style="--shiki-light: #1F2328; --shiki-dark: #E6EDF3;">});</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light: #6E7781; --shiki-dark: #8B949E;">// Type-safe, reliable, production-ready ✨</span></span>
<span class="line"><span style="--shiki-light: #CF222E; --shiki-dark: #FF7B72;">const</span><span style="--shiki-light: #0550AE; --shiki-dark: #79C0FF;"> category</span><span style="--shiki-light: #CF222E; --shiki-dark: #FF7B72;"> =</span><span style="--shiki-light: #CF222E; --shiki-dark: #FF7B72;"> await</span><span style="--shiki-light: #1F2328; --shiki-dark: #E6EDF3;"> classifier.</span><span style="--shiki-light: #8250DF; --shiki-dark: #D2A8FF;">execute</span><span style="--shiki-light: #1F2328; --shiki-dark: #E6EDF3;">({ text: userInput });</span></span></code></pre>
    </div>
  </div>
</template>

<script setup>
const copyCode = () => {
  const code = `import { createLlmExecutor, useLlm, createParser } from "llm-exe";

const classifier = createLlmExecutor({
  llm: useLlm("openai.gpt-4o-mini"),
  prompt: "Classify as bug/feature/question: {{text}}",
  parser: createParser("enum", {
    values: ["bug", "feature", "question"]
  })
});

// Type-safe, reliable, production-ready ✨
const category = await classifier.execute({ text: userInput });`;

  navigator.clipboard.writeText(code);
};
</script>

<style scoped>
.hero-code-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.hero-code-container .language-typescript {
  width: 100%;
  max-width: 640px;
  margin: 0;
  background-color: var(--vp-code-block-bg);
  border-radius: 8px;
  overflow: hidden;
}

.hero-code-container .language-typescript pre {
  margin: 0;
  padding: 20px 0;
  overflow-x: auto;
  white-space: pre;
}

.hero-code-container .language-typescript code {
  padding: 0 24px;
  display: block;
  font-size: 13px;
  line-height: 22px;
}
</style>