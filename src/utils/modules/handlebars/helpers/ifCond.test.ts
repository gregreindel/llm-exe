import { ifCond,  } from "@/utils/modules/handlebars/helpers";


describe("ifCond", () => {
  const fnMock = jest.fn();
  const inverseMock = jest.fn();
  const options = {
    fn: fnMock,
    inverse: inverseMock,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should call fn for '==' operator when v1 equals v2", () => {
    ifCond.call({}, "5", "==", "5", options);
    expect(fnMock).toHaveBeenCalled();
    expect(inverseMock).not.toHaveBeenCalled();
  });

  it("should call inverse for '==' operator when v1 does not equal v2", () => {
    ifCond.call({}, "5", "==", "6", options);
    expect(fnMock).not.toHaveBeenCalled();
    expect(inverseMock).toHaveBeenCalled();
  });

  it("should call fn for '===' operator when v1 strictly equals v2", () => {
    ifCond.call({}, "5", "===", "5", options);
    expect(fnMock).toHaveBeenCalled();
    expect(inverseMock).not.toHaveBeenCalled();
  });

  it("should call inverse for '===' operator when v1 does not strictly equal v2", () => {
    ifCond.call({}, 5 as any, "===", "5", options);
    expect(fnMock).not.toHaveBeenCalled();
    expect(inverseMock).toHaveBeenCalled();
  });

  it("should call fn for '!=' operator when v1 does not equal v2", () => {
    ifCond.call({}, "5", "!=", "6", options);
    expect(fnMock).toHaveBeenCalled();
    expect(inverseMock).not.toHaveBeenCalled();
  });

  it("should call inverse for '!=' operator when v1 equals v2", () => {
    ifCond.call({}, "5", "!=", "5", options);
    expect(fnMock).not.toHaveBeenCalled();
    expect(inverseMock).toHaveBeenCalled();
  });

  it("should call fn for '!==' operator when v1 strictly does not equal v2", () => {
    ifCond.call({}, "5", "!==", "6", options);
    expect(fnMock).toHaveBeenCalled();
    expect(inverseMock).not.toHaveBeenCalled();
  });

  it("should call inverse for '!==' operator when v1 strictly equals v2", () => {
    ifCond.call({}, 5 as any, "!==", 5 as any, options);
    expect(fnMock).not.toHaveBeenCalled();
    expect(inverseMock).toHaveBeenCalled();
  });

  it("should call fn for '<' operator when v1 is less than v2", () => {
    ifCond.call({}, "5", "<", "6", options);
    expect(fnMock).toHaveBeenCalled();
    expect(inverseMock).not.toHaveBeenCalled();
  });

  it("should call inverse for '<' operator when v1 is not less than v2", () => {
    ifCond.call({}, "6", "<", "5", options);
    expect(fnMock).not.toHaveBeenCalled();
    expect(inverseMock).toHaveBeenCalled();
  });

  it("should call fn for '<=' operator when v1 is less than or equal to v2", () => {
    ifCond.call({}, "5", "<=", "5", options);
    expect(fnMock).toHaveBeenCalled();
    expect(inverseMock).not.toHaveBeenCalled();
  });

  it("should call inverse for '<=' operator when v1 is not less than or equal to v2", () => {
    ifCond.call({}, "6", "<=", "5", options);
    expect(fnMock).not.toHaveBeenCalled();
    expect(inverseMock).toHaveBeenCalled();
  });

  it("should call fn for '>' operator when v1 is greater than v2", () => {
    ifCond.call({}, "6", ">", "5", options);
    expect(fnMock).toHaveBeenCalled();
    expect(inverseMock).not.toHaveBeenCalled();
  });

  it("should call inverse for '>' operator when v1 is not greater than v2", () => {
    ifCond.call({}, "5", ">", "6", options);
    expect(fnMock).not.toHaveBeenCalled();
    expect(inverseMock).toHaveBeenCalled();
  });

  it("should call fn for '>=' operator when v1 is greater than or equal to v2", () => {
    ifCond.call({}, "6", ">=", "6", options);
    expect(fnMock).toHaveBeenCalled();
    expect(inverseMock).not.toHaveBeenCalled();
  });

  it("should call inverse for '>=' operator when v1 is not greater than or equal to v2", () => {
    ifCond.call({}, "5", ">=", "6", options);
    expect(fnMock).not.toHaveBeenCalled();
    expect(inverseMock).toHaveBeenCalled();
  });

  it("should call fn for '&&' operator when both v1 and v2 are truthy", () => {
    ifCond.call({}, "true", "&&", "1", options);
    expect(fnMock).toHaveBeenCalled();
    expect(inverseMock).not.toHaveBeenCalled();
  });

  it("should call inverse for '&&' operator when either v1 or v2 is falsy", () => {
    ifCond.call({}, "", "&&", "1", options);
    expect(fnMock).not.toHaveBeenCalled();
    expect(inverseMock).toHaveBeenCalled();
  });

  it("should call fn for '||' operator when either v1 or v2 is truthy", () => {
    ifCond.call({}, "", "||", "1", options);
    expect(fnMock).toHaveBeenCalled();
    expect(inverseMock).not.toHaveBeenCalled();
  });

  it("should call inverse for '||' operator when both v1 and v2 are falsy", () => {
    ifCond.call({}, "", "||", "", options);
    expect(fnMock).not.toHaveBeenCalled();
    expect(inverseMock).toHaveBeenCalled();
  });

  it("should call inverse for any unknown operator", () => {
    ifCond.call({}, "5", "unknown", "5", options);
    expect(fnMock).not.toHaveBeenCalled();
    expect(inverseMock).toHaveBeenCalled();
  });
});