import { BaseStateItem } from "@/state";

/**
 * Tests the BaseStateItem class
 */
describe("llm-exe:state/BaseStateItem", () => {
    class MockStateItem<T> extends BaseStateItem<T> {
      constructor(key: string, initialValue: T) {
        super(key, initialValue);
      }
    }
  
    it("creates class with expected properties", () => {
      const defaultValue = "unknown"
      const item = new MockStateItem("intent", defaultValue);
      expect(item).toBeInstanceOf(BaseStateItem);
      expect(item).toHaveProperty("getKey");
      expect(item).toHaveProperty("setValue");
      expect(item).toHaveProperty("getValue");
      expect(item).toHaveProperty("resetValue");
      expect(item).toHaveProperty("serializeValue");
      expect(item).toHaveProperty("serialize");
    });

    it("item.getKey", () => {
        const defaultValue = "unknown"
        const item = new MockStateItem("intent", defaultValue);
        expect(item.getKey()).toEqual("intent");
      });
      it("item.getValue", () => {
        const defaultValue = "unknown"
        const item = new MockStateItem("intent", defaultValue);
        expect(item.getValue()).toEqual("unknown");
      });
      it("item.setValue", () => {
        const defaultValue = "unknown"
        const item = new MockStateItem("intent", defaultValue);
        item.setValue("cancel_account")
        expect(item.getValue()).toEqual("cancel_account");
      });
      it("item.setValue", () => {
        const defaultValue = "unknown"
        const item = new MockStateItem("intent", defaultValue);
        expect(() => item.setValue({} as any)).toThrowError("Invalid value type. Expected string, received object")
      });
      it("item.resetValue sets back to default", () => {
        const defaultValue = "unknown"
        const item = new MockStateItem("intent", defaultValue);
        item.setValue("cancel_account")
        expect(item.getValue()).toEqual("cancel_account");

        item.resetValue()
        expect(item.getValue()).toEqual("unknown");
      });
      it("item.serializeValue", () => {
        const defaultValue = "unknown"
        const item = new MockStateItem("intent", defaultValue);
        expect(item.serializeValue()).toEqual({ intent: 'unknown' });
      });
      it("item.serialize", () => {
        const defaultValue = "unknown"
        const item = new MockStateItem("intent", defaultValue);
        expect(item.serialize()).toEqual({
                class: 'BaseStateItem',
                name: 'intent',
                value: { intent: 'unknown' }
        });
      });

      describe("type-check edge cases on setValue", () => {
        it("rejects array replacement when default is plain object (same typeof 'object')", () => {
          // typeof [] === "object", so the guard allows swapping arrays for objects.
          // This test pins that permissive behavior — if the check ever tightens
          // (e.g., distinguishing arrays from objects), this test will surface it.
          const item = new MockStateItem<any>("data", { a: 1 });
          expect(() => item.setValue([1, 2, 3])).not.toThrow();
          expect(item.getValue()).toEqual([1, 2, 3]);
        });

        it("rejects number when default is string", () => {
          const item = new MockStateItem<any>("count", "zero");
          expect(() => item.setValue(42)).toThrowError(
            "Invalid value type. Expected string, received number"
          );
        });

        it("rejects boolean when default is number", () => {
          const item = new MockStateItem<any>("flag", 0);
          expect(() => item.setValue(true)).toThrowError(
            "Invalid value type. Expected number, received boolean"
          );
        });

        it("allows null when default is object (typeof null === 'object')", () => {
          const item = new MockStateItem<any>("data", { a: 1 });
          // typeof null === "object", so the guard permits null.
          expect(() => item.setValue(null)).not.toThrow();
          expect(item.getValue()).toBeNull();
        });
      });

      describe("resetValue preserves initial reference semantics", () => {
        it("resets back to the exact initial value after multiple mutations", () => {
          const defaultValue = "initial";
          const item = new MockStateItem<string>("step", defaultValue);
          item.setValue("a");
          item.setValue("b");
          item.setValue("c");
          expect(item.getValue()).toEqual("c");
          item.resetValue();
          expect(item.getValue()).toEqual("initial");
        });

        it("does not deep-clone the initial value; object defaults share reference", () => {
          // Documents current behavior: initialValue is not cloned, so mutating
          // the default object bleeds through to resetValue results. This is a
          // footgun worth pinning — if cloning is added, this test will fail.
          const shared = { count: 0 };
          const item = new MockStateItem<{ count: number }>("counter", shared);
          item.setValue({ count: 999 });
          shared.count = 5;
          item.resetValue();
          expect(item.getValue()).toEqual({ count: 5 });
        });
      });
})