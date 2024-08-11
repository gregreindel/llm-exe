import { Config } from "@/interfaces";
import { deepClone } from "@/utils/modules/deepClone";

export function withDefaultModel(obj1: Config, model: string){
    const copy = deepClone(obj1);
    
    if(copy.options.model){
      copy.options.model.default = model
    }else {
      copy.options.model = {
        default: model
      }
    }
  
    if(copy.mapBody.model){
      copy.mapBody.model.default = model
    }else {
      copy.mapBody.model = {
        key: "model",
        default: model
      }
    }
  
    return copy;
  }