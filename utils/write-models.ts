import { configs } from "@/llm/config";
import { writeFileSync } from "fs";

const data = {
  openai: {
    name: "OpenAI",
    models: [],
  },
  anthropic: {
    name: "Anthropic",
    models: [],
  },
  google: {
    name: "Google",
    models: [],
  },
  ollama: {
    name: "Ollama",
    models: [],
  },
  xai: {
    name: "XAi",
    models: [],
  },
  "amazon:anthropic": {
    name: "Amazon Bedrock - Anthropic",
    models: [],
  },
  "amazon:meta": {
    name: "Amazon Bedrock - Meta",
    models: [],
  },
};

export function writeModels() {
  const allModelKeys = Object.keys(configs) as (keyof typeof configs)[];
  for (const modelKey of allModelKeys) {
    const [provider, ...parts] = modelKey.split(".");
    // put this piece back together
    const modelName = parts.join(".");
    if (modelName === "chat.v1") {
      // this is any model via chat.v1
    } else if (modelName === "chat-mock.v1") {
      // this is a mock model
    } else {
      // shorthand model
      if ((data as any)[provider]) {
        (data as any)[provider].models.push(modelName);
      } else {
        console.error(`Provider ${provider} not found in data object`);
      }
    }
  }

  writeFileSync(
    "docs/.vitepress/data/models.json",
    JSON.stringify(data, null, 2),
    "utf-8"
  );
}

(async () => {
  writeModels();
})();
