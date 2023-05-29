import { useExecutors, createCallableExecutor } from "@/plugins/callable";
import { createCoreExecutor, createLlmExecutor } from "@/executor/_functions";
import { BaseExecutor } from "@/executor/_base";
import * as utils from "./utils";
import { BaseLlm, OpenAI, createLlmOpenAi } from "./llm";
import { EmbeddingOpenAI } from "./embedding/openai";
import { PineconeVectorStore } from "./vector";

import {
  BasePrompt,
  ChatPrompt,
  TextPrompt,
  createPrompt,
  createChatPrompt,
} from "@/prompt";

import {
  BaseParser,
  CustomParser,
  createParser,
  createCustomParser,
} from "./parser";

import {
  DefaultState,
  BaseStateItem,
  DefaultStateItem,
  createState,
  createStateItem,
} from "./state";

export const simpleChain = {
  /**
   * Utilities
   */
  utils,
  /**
   * Llm
   */
  BaseLlm,
  OpenAI,
  createLlmOpenAi,
  /**
   * Prompt
   */
  BasePrompt,
  TextPrompt,
  ChatPrompt,
  createPrompt,
  createChatPrompt,
  /**
   * Parsers
   */
  BaseParser,
  CustomParser,
  createParser,
  createCustomParser,
  /**
   * Core Functions
   */
  BaseExecutor,
  createCoreExecutor,
  createLlmExecutor,

  /**
   * Callable
   */
  useExecutors,
  createCallableExecutor,
  /**
   * Embedding
   */
  EmbeddingOpenAI,
  PineconeVectorStore,
  /**
   * State
   */
  DefaultState,
  BaseStateItem,
  DefaultStateItem,
  createState,
  createStateItem,
};
