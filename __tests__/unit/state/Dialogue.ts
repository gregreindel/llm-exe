import { BaseStateItem, Dialogue, createDialogue } from "@/state";

/**
 * Tests Dialogue
 */
describe("llm-exe:state/Dialogue", () => {
    it("defaults to text dialogue", () => {
        const dialogue = createDialogue("main");
        expect(dialogue).toBeInstanceOf(Dialogue);
        expect(dialogue).toBeInstanceOf(BaseStateItem);
      });
    
    it("defaults to text dialogue", () => {
      const dialogue = new Dialogue("main");
      expect(dialogue).toBeInstanceOf(Dialogue);
      expect(dialogue).toHaveProperty("name");
      expect(dialogue.name).toEqual("main");
    });
    it("can set user message on state", () => {
        const dialogue = new Dialogue("main");
        dialogue.setUserMessage("Hello, anybody home?")
        const history = dialogue.getHistory()
        expect(history).toHaveLength(1);
        expect(history[0].content).toEqual("Hello, anybody home?");
        expect(history[0].role).toEqual("user");
    });
    it("can set user message with name on state", () => {
        const dialogue = new Dialogue("main");
        dialogue.setUserMessage("Hello, anybody home?", "Greg")
        const history = dialogue.getHistory()
        expect(history).toHaveLength(1);
        expect(history[0].content).toEqual("Hello, anybody home?");
        expect(history[0].role).toEqual("user");
        if(history[0].role === "user"){
            expect(history[0]?.name).toEqual("Greg");
        }
    });
    it("does not set empty user message on state", () => {
        const dialogue = new Dialogue("main");
        dialogue.setUserMessage("")
        const history = dialogue.getHistory()
        expect(history).toHaveLength(0);
    });
    it("can set assistant message on state", () => {
        const dialogue = new Dialogue("main");
        dialogue.setAssistantMessage("Hello, anybody home?")
        const history = dialogue.getHistory()
        expect(history).toHaveLength(1);
        expect(history[0].content).toEqual("Hello, anybody home?");
        expect(history[0].role).toEqual("assistant");
    });
    it("does not set assistant user message on state", () => {
        const dialogue = new Dialogue("main");
        dialogue.setAssistantMessage("")
        const history = dialogue.getHistory()
        expect(history).toHaveLength(0);
    });
    it("can set system message on state", () => {
        const dialogue = new Dialogue("main");
        dialogue.setSystemMessage("Hello, anybody home?")
        const history = dialogue.getHistory()
        expect(history).toHaveLength(1);
        expect(history[0].content).toEqual("Hello, anybody home?");
        expect(history[0].role).toEqual("system");
    });
    it("does not set system user message on state", () => {
        const dialogue = new Dialogue("main");
        dialogue.setSystemMessage("")
        const history = dialogue.getHistory()
        expect(history).toHaveLength(0);
    });
    it("can set all messages on state", () => {
        const dialogue = new Dialogue("main");
        dialogue.setSystemMessage("This is the system message.")
        dialogue.setUserMessage("This is the user message")
        dialogue.setAssistantMessage("Hello, this is the assistant")
        const history = dialogue.getHistory()
        expect(history).toHaveLength(3);
        expect(history[0].content).toEqual("This is the system message.");
        expect(history[0].role).toEqual("system");

        expect(history[1].content).toEqual("This is the user message");
        expect(history[1].role).toEqual("user");

        expect(history[2].content).toEqual("Hello, this is the assistant");
        expect(history[2].role).toEqual("assistant");
    });
    it("does not set system user message on state", () => {
        const dialogue = new Dialogue("main");
        dialogue.setMessageTurn("Hi, anyone there?", "Yes! we're always here")
        const history = dialogue.getHistory()
        expect(history).toHaveLength(2);

        expect(history[0].content).toEqual("Hi, anyone there?");
        expect(history[0].role).toEqual("user");

        expect(history[1].content).toEqual("Yes! we're always here");
        expect(history[1].role).toEqual("assistant");
    });
    it("can set multiple messages from history", () => {
        const dialogue = new Dialogue("main");

        dialogue.setHistory([{
            role: "user",
            content: "Hello?"
        },{
            role: "assistant",
            content: "Hello!!"
        },{
            role: "system",
            content: "Stop saying hello"
        }])

        const history = dialogue.getHistory()
        expect(history).toHaveLength(3);

        expect(history[0].content).toEqual("Hello?");
        expect(history[0].role).toEqual("user");

        expect(history[1].content).toEqual("Hello!!");
        expect(history[1].role).toEqual("assistant");

        expect(history[1].content).toEqual("Stop saying hello");
        expect(history[1].role).toEqual("system");
    });
    it("can set multiple messages from history", () => {
        const dialogue = new Dialogue("main");

        dialogue.setHistory([{
            role: "user",
            content: "Hello?",
            name: "Greg"
        }])

        const history = dialogue.getHistory()
        expect(history).toHaveLength(3);

        expect(history[0].content).toEqual("Hello?");
        expect(history[0].role).toEqual("user");
        expect((history[0] as any).name).toEqual("Greg");
    });
    it("can serialize state item", () => {
        const dialogue = new Dialogue("main");
        dialogue.setMessageTurn("Hi, anyone there?", "Yes! we're always here")
        expect(dialogue.serialize()).toEqual({
            class: 'Dialogue',
            name: 'main',
            value: 
             [ { role: 'user', content: 'Hi, anyone there?' },
               { role: 'assistant', content: 'Yes! we\'re always here' } ] 
        });
    });
});
