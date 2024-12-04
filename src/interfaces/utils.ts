export type PrimitiveValue =
  | bigint
  | boolean
  | null
  | number
  | string
  | symbol
  | undefined;

export type ObjectValue = PrimitiveValue | PlainObject | ObjectArray;

export interface PlainObject {
  [key: string]: ObjectValue;
}

export interface ObjectArray extends Array<ObjectValue> {}

export interface ResultAttributes<R = any, A = Record<string, any>> {
  result: R;
  attributes: A;
}

export interface Serializable {
  serialize?(): Record<string, any>;
  deserialize?(): void;
}

export interface EmptyObject {
  [key: string]: never;
}
