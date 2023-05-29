import { uuid } from "@/utils";

export abstract class BaseLlmOutput {
  protected id: string;
  protected name: string | undefined;
  protected created: number | undefined;
  protected results: any[] = [];

  protected usage: any = {};

  constructor(result: any) {
    this.id = uuid();
    this.setResult(result);
  }

  getResults() {
    return [...this.results];
  }
  abstract setResult(result: any): void;
  abstract getResult(resultIndex: number): any;
  abstract getResultContent(resultIndex?: number): any;
}
