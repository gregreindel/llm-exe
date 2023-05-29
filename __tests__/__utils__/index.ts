import { ExecutorContext } from "@/interfaces"
import { assert } from "@/utils"

export function validateExecutorContext(_executor: ExecutorContext<any,any>){
    assert(typeof _executor.start === "number", "Invalid Date")
    if(_executor.end) assert(typeof _executor.end === "number", "Invalid endTime")
    assert(typeof _executor.input === "object", "invalid input")
    assert(typeof _executor.handlerInput === "object", "invalid handlerInput")
    assert(typeof _executor.handlerOutput === "object", "invalid handlerOutput")
    assert(typeof _executor.output === "object", "invalid output")
    assert(typeof _executor._handlerOutput === "object" && Array.isArray(_executor._handlerOutput), "invalid _handlerOutput")
    assert(typeof _executor._output === "object" && Array.isArray(_executor._output), "invalid _output")
  
    if(_executor.metadata){
      assert(typeof _executor.metadata === "object", "invalid metadata")
      assert(typeof _executor.metadata.id === "string", "invalid id")
      assert(typeof _executor.metadata.name === "string", "invalid id")
    }
    if(_executor.attributes){
      assert(typeof _executor.attributes === "object", "invalid attributes")
    }
  
    return true;
  }