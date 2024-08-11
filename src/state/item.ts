import { Serializable } from "@/types";
import { assert } from "@/utils/modules/assert";

export abstract class BaseStateItem<T> implements Serializable {
  protected key: string;
  protected value: T;
  protected initialValue: T;

  constructor(key: string, initialValue: T) {
    this.key = key;
    this.value = initialValue;
    this.initialValue = initialValue;
  }
  setValue(value: T) {
    assert(
      typeof value === typeof this.value,
      `Invalid value type. Expected ${typeof this
        .value}, received ${typeof value}`
    );
    this.value = value;
  }
  getKey() {
    return this.key;
  }
  getValue(): T {
    return this.value;
  }
  resetValue() {
    this.value = this.initialValue;
  }
  serializeValue() {
    return {
      [this.getKey()]: this.getValue(),
    };
  }
  serialize(): { class: string; name: string; value: any } {
    return {
      class: "BaseStateItem",
      name: this.getKey(),
      value: this.serializeValue(),
    };
  }
  // deserialize() {}
}

export class DefaultStateItem extends BaseStateItem<any> {
  constructor(name: string, defaultValue: any) {
    super(name, defaultValue);
  }
  // serialize() { return {}; }
  // deserialize() {}
}
