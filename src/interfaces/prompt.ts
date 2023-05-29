export type TextPromptType = "text";
export type ChatPromptType = "chat";
export type PromptType = TextPromptType | ChatPromptType;

export type PromptHelper = { name: string; handler: (args: any) => any };
export type PromptPartial = { name: string; template: string };
export interface PromptTemplateOptions {
  partials?: PromptPartial[];
  helpers?: PromptHelper[];
}

export interface PromptOptions extends PromptTemplateOptions {}
export interface ChatPromptOptions extends PromptOptions {
  allowUnsafeUserTemplate?: boolean;
}
