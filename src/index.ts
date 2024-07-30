// import { LlmExecutorExecuteOptions } from './interfaces/openai';
import { useExecutors, createCallableExecutor } from "@/plugins/callable";
import { createCoreExecutor, createLlmExecutor } from "@/executor/_functions";
import { BaseExecutor } from "@/executor/_base";
import * as utils from "./utils";
import { useLlm } from "./llm";
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

import { LlmExecutorOpenAiFunctions } from "@/executor/llm-openai-function";

export const llmExe = {
  /**
   * Utilities
   */
  utils,
  /**
   * Llm
   */
  useLlm,
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
  LlmExecutorOpenAiFunctions,
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
