import { withFnAsync } from "./with"
import { ifFnAsync } from "./if"
import { eachFnAsync } from "./each"
import { unlessFnAsync } from "./unless"

export const asyncCoreOverrideHelpers = {
    if: ifFnAsync,
    with: withFnAsync,
    each: eachFnAsync,
    unless: unlessFnAsync
}