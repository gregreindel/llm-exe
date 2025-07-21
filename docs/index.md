---
title: "llm-exe | Build Composable LLM Functions"
description: "LLM-EXE is a Typescript package for building structured, reliable AI applications. Define typed LLM functions, compose reusable executors, and integrate seamlessly with prompts, parsers, and dialogue state."
layout: home
hero:
  name: llm-exe
  text: "Stop fighting with LLM APIs."
  tagline: Start building composable, type-safe AI applications that just work.
  image:
    src: https://assets.llm-exe.com/logo.png
    alt: llm-exe
  actions:
    - theme: brand
      text: Get Started
      link: /intro/install.html
    - theme: alt
      text: See Examples
      link: /examples
    - theme: text
      text: Github
      link: https://github.com/gregreindel/llm-exe

features:
  - title: Type-Safe Everything
    details: Full TypeScript support with inferred types throughout your LLM chains. No more guessing what data you're working with.
  - title: Provider Agnostic
    details: Same code works with OpenAI, Anthropic, Google, xAI, Ollama, Bedrock, and more. Switch with one line.
  - title: Production Ready
    details: Built-in retries, timeouts, error handling, and schema validation. Battle-tested with 100% test coverage.
  - title: Composable Executors
    details: Chain executors like building blocks. Each piece does one thing well and combines naturally.
  - title: Powerful Parsers
    details: Extract exactly what you need - JSON, lists, regex, markdown blocks. Guaranteed output format or throw.
  - title: LLMs Can Call Your Code
    details: Turn any function into an LLM-callable tool. Let AI use your database, APIs, or business logic safely.
---

<HomeAfterIntro>

<div class="home-blocks">
<div class="home-block-left">
 <div class="home-block-title">You've Seen This Nightmare</div>
    <div class="home-block-description">Every LLM project starts like this: debugging JSON errors, writing boilerplate retries, juggling timeouts, and praying your parse didn’t break. It sucks.</div>
      <ul class="home-block-description-list">
  <li>JSON.parse() with fingers crossed</li>
  <li>Everything is type any</li>
  <li>Manual validation for every response</li>
  <li>All this and you only support one provider</li>
  </ul>
</div>
<div class="home-block-right">

```typescript
// Every LLM project starts like this...
const response = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [{ role: "user", content: makePrompt(data) }],
  response_format: { type: "json_object" },
});
const text = response.choices[0].message.content;
const parsed = JSON.parse(text); // 🤞 hope it's valid JSON

// Type safety? What's that?
const category = parsed.category; // any
const items = parsed.items; // undefined? array? who knows

// Oh right, need to validate this somehow
if (!["bug", "feature", "question"].includes(category)) {
  // Model hallucinated a new category. Now what?
}

// And when OpenAI is down or rate limited...
// TODO: Add retries
// TODO: Add exponential backoff
// TODO: Switch to Claude when this fails
```

</div>
</div>

<div class="home-blocks home-blocks-alt">
<div class="home-block-left">
 <div class="home-block-title">What if LLM Calls Were Just Normal Functions?</div>
    <div class="home-block-description">What if every LLM call was as reliable as calling a regular function? Type-safe inputs, validated outputs, built-in retries. Just async functions that happen to be powered by AI.</div>
  <ul class="home-block-description-list">
  <li>Real TypeScript types, no more any/unknown</li>
  <li>Validated outputs that match your schema</li>
  <li>Just import and call, like any other function</li>
  <li>One-line provider switching</li>
  </ul>

</div>
<div class="home-block-right">

```typescript
import {
  useLlm,
  createChatPrompt,
  createParser,
  createLlmExecutor,
} from "llm-exe";

// Define once, use everywhere
async function llmClassifier(text: string) {
  return createLlmExecutor({
    llm: useLlm("openai.gpt-4o-mini"),
    prompt: createChatPrompt<{ text: string }>(
      "Classify this as 'bug', 'feature', or 'question': {{text}}"
    ),
    parser: createParser("stringExtract", {
      enum: ["bug", "feature", "question"],
    }),
  }).execute({ text });
}

// It's just a typed function now
const category = await llmClassifier(userInput);
// category is typed as "bug" | "feature" | "question" ✨
```

</div>
</div>

<!-- -->
<div class="home-blocks">
<div class="home-block-left">
 <div class="home-block-title">Build Complex Flows from Simple Parts</div>
    <div class="home-block-description">Build complex AI workflows from simple, modular functions. Each executor is self-contained—swap models, update prompts, or change parsers without touching the rest of your code.</div>
  <ul class="home-block-description-list">
  <li>Prompt + LLM + Parser = Executor</li>
  <li>Each piece is swappable</li>
  <li>Chain them together</li>
  <li>Test them separately</li>
  </ul>

</div>
<div class="home-block-right">

```typescript
// Each piece does one thing well
const summarizer = createLlmExecutor({
  llm: useLlm("openai.gpt-4o-mini"),
  prompt: createChatPrompt("Summarize: {{text}}"),
  parser: createParser("string"),
});

const translator = createLlmExecutor({
  llm: useLlm("anthropic.claude-3-5-haiku"),
  prompt: createChatPrompt("Translate to {{language}}: {{text}}"),
  parser: createParser("string"),
});

// Combine them naturally
const summary = await summarizer.execute({ text: article });
const spanish = await translator.execute({
  text: summary,
  language: "Spanish",
});
```

</div>
</div>

<!-- -->
<div class="home-blocks home-blocks-alt">
<div class="home-block-left">
 <div class="home-block-title">Production-Ready Out of the Box</div>
    <div class="home-block-description">No more manual retry loops. No more parsing prayers. Built-in error handling, timeouts, and hooks. If the output doesn't match your schema, you'll know immediately.</div>
  <ul class="home-block-description-list">
  <li>Automatic retries and timeouts</li>
  <li>Schema validation that throws on mismatch</li>
  <li>Hooks for logging and monitoring</li>
  <li>Did I mention change LLM's with one line?</li>
  </ul>

</div>
<div class="home-block-right">

```typescript
const analyst = createLlmExecutor(
  {
    llm: useLlm("openai.gpt-4o"),
    prompt: createChatPrompt<{ data: any }>(
      "Analyze this data and return insights as JSON: {{data}}"
    ),
    parser: createParser("json", {
      schema: {
        insights: { type: "array", items: { type: "string" } },
        score: { type: "number", min: 0, max: 100 },
      },
    }),
  },
  {
    // Built-in retry, timeout, hooks
    maxRetries: 3,
    timeout: 30000,
    hooks: {
      onSuccess: (result) => logger.info("Analysis complete", result),
      onError: (error) => logger.error("Analysis failed", error),
    },
  }
);

// Guaranteed to match schema or throw
const { insights, score } = await analyst.execute({ data: salesData });

// You can also bind events to an executor!
analyst.on("complete", (result) => {
  logger.info("Analysis complete", result);
});
```

</div>
</div>

<!-- -->
<div class="home-blocks">
<div class="home-block-left">
 <div class="home-block-title">Your Functions Become AI Tools</div>
    <div class="home-block-description">Turn any function into an LLM-callable tool—even with models that don't support function calling. The LLM figures out what to do, you wire up the execution. Works with every model, not just the fancy ones.</div>
  <ul class="home-block-description-list">
  <li>Works with ALL models, even without native function calling</li>
  <li>The LLM plans what to do, you control execution</li>
  <li>No special agent framework needed</li>
  <li>You control the execution flow and security</li>
  </ul>

</div>
<div class="home-block-right">

```typescript
import { createCallableExecutor, useExecutors } from "llm-exe";

// Your existing code becomes LLM-callable
const queryDB = createCallableExecutor({
  name: "query_database",
  description: "Query our PostgreSQL database",
  input: "SQL query to execute",
  handler: async ({ input }) => {
    const results = await db.query(input); // Your actual DB!
    return { result: results.rows };
  },
});

const sendEmail = createCallableExecutor({
  name: "send_email",
  description: "Send email via our email service",
  input: "JSON with 'to', 'subject', 'body'",
  handler: async ({ input }) => {
    const { to, subject, body } = JSON.parse(input);
    await emailService.send({ to, subject, body }); // Real emails!
    return { result: "Email sent successfully" };
  },
});

// Let the LLM use your tools
const assistant = createLlmExecutor({
  llm: useLlm("openai.gpt-4o"),
  prompt: createChatPrompt(`Help the user with their request.
You can query the database and send emails.`),
  parser: createParser("json"),
});

const tools = useExecutors([queryDB, sendEmail]);

// LLM decides what to do and calls YOUR functions
const plan = await assistant.execute({
  request: "Send our top 5 customers a thank you email",
});
// LLM might return: { action: "query_database", input: "SELECT email FROM customers ORDER BY revenue DESC LIMIT 5" }

const result = await tools.callFunction(plan.action, plan.input);
```

</div>
</div>

<!-- -->

<div class="home-blocks home-blocks-alt">
<div class="home-block-left">
 <div class="home-block-title">One-Line to Switch Providers</div>
    <!-- <div class="home-block-description">Every LLM project starts like this: debugging JSON errors, writing boilerplate retries, juggling timeouts, and praying your parse didn’t break. It sucks.</div> -->

</div>
<div class="home-block-right">

```typescript
// Change ONE line to switch providers
const llm = useLlm("openai.gpt-4o");
// const llm = useLlm("anthropic.claude-3-5-sonnet");
// const llm = useLlm("google.gemini-2.0-flash");
// const llm = useLlm("xai.grok-2");
// const llm = useLlm("ollama.llama-3.3-70b");

// Everything else stays exactly the same ✨
```

</div>
</div>

---

## Build a Reasoning Agent in 200 Lines

Want to see something incredible? Check out our [reasoning agent example](/examples#reasoning-agent) that:

- Thinks step-by-step through problems
- Uses tools to gather information
- Provides both answers AND reasoning traces
- Works with ANY LLM provider

No magic. Just clean composition.

---

## Why Developers Love llm-exe

> "Finally, LLM calls that don't feel like stringly-typed nightmares."

> "Switched from OpenAI to Claude in literally one line. Everything just worked."

> "The type safety alone saved us hours of debugging. The composability changed how we build."

> "As an AI, I shouldn't play favorites... but being able to switch providers with one line means developers can always choose the best model for the job. Even if it's not me." - Claude

---

## Ready to Build Something Incredible?

Stop wrestling with LLM APIs. Start shipping AI features that actually work.

<div style="display: flex; gap: 1rem; margin-top: 2rem;">
  <a href="/intro/install.html" style="display: inline-block; padding: 0.75rem 1.5rem; background: var(--vp-c-brand); color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">Get Started →</a>
  <a href="/examples" style="display: inline-block; padding: 0.75rem 1.5rem; background: var(--vp-c-bg-soft); color: var(--vp-c-text-1); text-decoration: none; border-radius: 8px; font-weight: 600;">Browse Examples</a>
</div>

</HomeAfterIntro>

<style>
.home-blocks {
    display: flex;
    justify-content: start;
    align-items: center;
    padding: 40px 0;
    border-bottom: 1px solid #141212ff;
       column-gap: 3rem;
}

.home-blocks.home-blocks-alt {
    flex-direction: row-reverse;
}

.home-block-left {
    width: 40%;
}
.home-block-right {
     width: 60%;
}
.home-block-title {
  font-size:2rem;
  font-weight:700;
  margin-bottom:22px;
  line-height:1.125
}

.home-block-description {
      color: var(--vp-c-text-2);
}
</style>
