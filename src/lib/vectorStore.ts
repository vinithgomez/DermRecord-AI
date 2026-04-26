export type Document = {
  id: string;
  text: string;
  embedding: number[];
  metadata?: any;
};

export class VectorStore {
  private documents: Document[] = [];

  addDocument(doc: Document) {
    this.documents.push(doc);
  }

  // Calculates the cosine similarity between two vectors
  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  // Searches for the top K most similar documents to the query embedding
  search(queryEmbedding: number[], k: number = 3): (Document & { score: number })[] {
    const scoredDocs = this.documents.map(doc => ({
      ...doc,
      score: this.cosineSimilarity(queryEmbedding, doc.embedding)
    }));

    // Sort by descending score (highest similarity first)
    scoredDocs.sort((a, b) => b.score - a.score);
    return scoredDocs.slice(0, k);
  }
}
