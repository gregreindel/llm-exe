export class BaseVectorStore {
  public client: any;

  constructor(client: any) {
    this.client = client;
  }
  async initialize() {}
  fromTexts() {}
  fromDocuments() {}
  addVectors() {}
  addDocuments() {}
  similaritySearch() {}
  similaritySearchWithScore() {}
}
