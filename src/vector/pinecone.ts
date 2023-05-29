import { BaseVectorStore } from "./base";

export class PineconeVectorStore extends BaseVectorStore {
  constructor(client: any) {
    super(client);
    this.client = new client();
  }
  async initialize() {
    await this.client.init({
      environment: process.env.PINECONE_CLIENT_ENVIRONMENT,
      apiKey: process.env.PINECONE_CLIENT_API_KEY,
    });
  }
  async useIndex(indexName: string) {
    await this.initialize();
    return this.client.Index(indexName);
  }
}
