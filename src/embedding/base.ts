export class BaseEmbedding {
  protected client: any;
  protected timeout: number;

  protected maxDelay: number;
  protected numOfAttempts: number;
  protected jitter: "none" | "full";
  constructor(client: any, options: any) {
    this.client = client;
    this.timeout = options.timeout || 10000;

    this.jitter = options.jitter || "none";
    this.maxDelay = options.maxDelay || 4000;
    this.numOfAttempts = options.numOfAttempts || 3;
  }
}
 