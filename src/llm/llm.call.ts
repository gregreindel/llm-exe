import { getOutputParser } from "@/llm/output";
import { apiRequest } from "@/utils/modules/request";
import { replaceTemplateStringSimple } from "@/utils/modules/replaceTemplateStringSimple";
import { getLlmConfig } from "@/llm/config";
import { mapBody } from "@/llm/_utils.mapBody";
import { parseHeaders } from "@/llm/_utils.parseHeaders";

import {
  GenericFunctionCall,
  GenericLLm,
  IChatMessages,
  LlmProvider,
  LlmProviderKey,
  OpenAiLlmExecutorOptions,
} from "@/types";
import { normalizeFunctionCall } from "./output/_util";
import { cleanJsonSchemaFor } from "./output/_utils/cleanJsonSchemaFor";


export async function useLlm_call(
  state: GenericLLm & { provider: LlmProvider; key: LlmProviderKey },
  messages: string | IChatMessages,
  _options?: OpenAiLlmExecutorOptions<GenericFunctionCall>
) {
  const config = getLlmConfig(state.key);

  const input = mapBody(
    config.mapBody,
    Object.assign({}, state, {
      prompt: messages,
    })
  );

  // move me!
  // this needs to be improved
  if (_options && _options?.jsonSchema) {
    if (state.provider === "openai.chat") {
      const curr = input["response_format"] || {};
      const newObj = Object.assign(curr, {
        type: "json_schema",
        json_schema: {
          name: "output",
          schema: cleanJsonSchemaFor(_options?.jsonSchema, "openai.chat"),
        },
      });

      if (
        typeof _options?.functionCallStrictInput === "undefined" ||
        !!_options?.functionCallStrictInput
      ) {
        newObj["json_schema"]["strict"] = true;
      }
      input["response_format"] = newObj;
    }
  }

  if (_options && _options?.functionCall) {
    if (state.provider === "anthropic.chat") {
      if (_options?.functionCall === "none") {
        _options.functions = [];
      } else if (
        _options?.functionCall === "auto" ||
        _options?.functionCall === "any"
      ) {
        input["tool_choice"] = { type: _options?.functionCall };
      } else {
        input["tool_choice"] = _options?.functionCall;
      }
    } else if (state.provider === "openai.chat") {
      input["tool_choice"] = normalizeFunctionCall(
        _options?.functionCall,
        "openai"
      );
    }
  }
  if (_options && _options?.functions?.length) {
    if (state.provider === "anthropic.chat") {
      input["tools"] = _options.functions.map((f) => ({
        name: f.name,
        description: f.description,
        input_schema: f.parameters,
      }));
    } else if (state.provider === "openai.chat") {
      input["tools"] = _options.functions.map((f) => {
        const props = {
          name: f?.name,
          description: f?.description,
          parameters: f?.parameters,
        } 
        return {
          type: "function",
          function: Object.assign(
            props,
            {
              parameters: cleanJsonSchemaFor(props.parameters, "openai.chat"),
            },
            { strict: true }
          ),
        };
      });
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
