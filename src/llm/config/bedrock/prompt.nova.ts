import { IChatMessages } from "@/interfaces";

export function amazonNovaPromptSanitize(
    _messages: string | IChatMessages,
    _inputBodyObj: Record<string, any>,
    _outputObj: Record<string, any>
  ) {

    return []
    // return [
    //     {
    //       "role": "user",
    //       "content": [
    //         {
    //           "type": "text",
    //           "text": "this is where you place your input text"
    //         }
    //       ]
    //     }
    //   ]
  }