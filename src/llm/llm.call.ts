import { getOutputParser } from "@/llm/output";
import { apiRequest } from "@/utils/modules/request";
import { replaceTemplateStringSimple } from "@/utils/modules/replaceTemplateStringSimple";
import { getLlmConfig } from "@/llm/config";
import { mapBody } from "@/llm/_utils.mapBody";
import { parseHeaders } from "@/llm/_utils.parseHeaders";
import { pick } from "lodash";

import {
  GenericLLm,
  IChatMessages,
  LlmProvidor,
  LlmProvidorKey,
  OpenAiLlmExecutorOptions,
} from "@/types";
import { normalizeFunctionCall } from "./output/_util";

export async function useLlm_call(
  state: GenericLLm & { providor: LlmProvidor; key: LlmProvidorKey },
  messages: string | IChatMessages,
  _options?: OpenAiLlmExecutorOptions<"none">
) {
  const config = getLlmConfig(state.key);

  const input = mapBody(
    config.mapBody,
    Object.assign({}, state, {
      prompt: messages,
    })
  );

  // move me!
  // this sucks!
  if (_options && _options?.function_call) {
    if (state.providor === "anthropic.chat") {
      if(_options?.function_call === "none"){
         _options.functions = [];
      } else if (
        _options?.function_call === "auto" ||
        _options?.function_call === "any" 
      ) {
        input["tool_choice"] = { type: _options?.function_call };
      } else {
        input["tool_choice"] = _options?.function_call
      }
    } else if (state.providor === "openai.chat") {
      input["tool_choice"] = normalizeFunctionCall(_options?.function_call, "openai");
    }
  }
  if (_options && _options?.functions?.length) {
    if (state.providor === "anthropic.chat") {
      input["tools"] = _options.functions.map((f) => ({
        name: f.name,
        description: f.description,
        input_schema: f.parameters,
      }));
    } else if (state.providor === "openai.chat") {
      input["tools"] = _options.functions.map((f) => ({
        type: "function",
        function: pick(f, ["name", "description", "parameters"]),
      }));
    }
  }
  // END move me!

  const body = JSON.stringify(input);

  const url = replaceTemplateStringSimple(config.endpoint, state);

  const headers = await parseHeaders(config, state, {
    url,
    headers: {},
    body: body,
  });

  const response =
    config.provider === "openai.chat-mock"
      ? {
          id: "0123-45-6789",
          model: "model",
          created: new Date().getTime(),
          usage: { completion_tokens: 0, prompt_tokens: 0, total_tokens: 0 },
          choices: [
            {
              message: {
                role: "assistant",
                content: `Hello world from LLM! The input was ${JSON.stringify(
                  messages
                )}`,
              },
            },
          ],
        }
      : await apiRequest(url, {
          method: config.method,
          body: body,
          headers: headers,
        });

  return getOutputParser(state, response);
}
