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
})