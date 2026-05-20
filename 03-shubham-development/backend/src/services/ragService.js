import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import lunr from "lunr";
import ENV from "../config/env.config.js";

class RAGService {
  constructor() {
    this.llm = null;
    this.embeddings = null;
    this.vectorStore = null;
    this.lunrIndex = null;
    this.lunrDocs = new Map();
    this.documents = [];
    this.initialized = false;
    this.useVectorSearch = false;
    this.cache = new Map(); // question key → result, avoids repeat API calls
  }

  async init() {
    if (this.initialized) return;

    this.embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: ENV.GOOGLE_GEMINI_API_KEY,
      model: "text-embedding-004",
      maxRetries: 0,
    });

    this.llm = new ChatGoogleGenerativeAI({
      apiKey: ENV.GOOGLE_GEMINI_API_KEY,
      modelName: "gemini-pro",
      temperature: 0.2,
      maxRetries: 0,
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
      ],
    });

    this.initialized = true;
    console.log("✓ RAG service initialised");
  }

  async loadDocuments(texts) {
    await this.init();

    const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 400, chunkOverlap: 80 });
    const docs = await splitter.createDocuments(texts);
    this.documents = docs;

    console.log(`📄 ${docs.length} chunks created`);

    // Build vector store (Gemini embeddings) — fall back to Lunr if it fails
    try {
      this.vectorStore = await MemoryVectorStore.fromDocuments(docs, this.embeddings);
      this.useVectorSearch = true;
      console.log("✓ Vector store ready");
    } catch (err) {
      console.warn("Vector store failed, Lunr only:", err.message);
      this.useVectorSearch = false;
    }

    // Always build Lunr keyword index as offline fallback
    this._buildLunrIndex(docs);
    console.log("✓ RAG ready");
  }

  _buildLunrIndex(docs) {
    const self = this;
    this.lunrDocs = new Map();
    this.lunrIndex = lunr(function () {
      this.ref("id");
      this.field("content");
      docs.forEach((doc, i) => {
        const id = String(i);
        this.add({ id, content: doc.pageContent });
        self.lunrDocs.set(id, doc);
      });
    });
  }

  _lunrSearch(query, k = 3) {
    if (!this.lunrIndex) return [];
    try {
      return this.lunrIndex
        .search(query)
        .slice(0, k)
        .map((r) => this.lunrDocs.get(r.ref))
        .filter(Boolean);
    } catch {
      return [];
    }
  }

  // Extract the best-matching answer from FAQ docs without calling the LLM
  _extractBestAnswer(docs, question) {
    const keywords = question.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
    let bestAnswer = null;
    let bestScore = 0;

    for (const doc of docs) {
      const pairs = this._extractQAPairs(doc.pageContent);
      for (const qa of pairs) {
        const haystack = (qa.question + " " + qa.answer).toLowerCase();
        const score = keywords.filter((k) => haystack.includes(k)).length;
        if (score > bestScore) {
          bestScore = score;
          bestAnswer = qa.answer;
        }
      }
    }

    return bestAnswer || docs[0].pageContent.trim().slice(0, 400);
  }

  _extractQAPairs(text) {
    const pairs = [];
    const regex = /Q:\s*(.*?)\s*A:\s*(.*?)(?=Q:|$)/gs;
    let match;
    while ((match = regex.exec(text)) !== null) {
      pairs.push({ question: match[1].trim(), answer: match[2].trim() });
    }
    return pairs;
  }

  async query(question, k = 3) {
    await this.init();

    const q = question?.trim();
    if (!q || q.length < 3) {
      return { success: true, answer: "Please ask a valid question.", method: "blocked" };
    }

    const key = q.toLowerCase();

    // Greetings — no retrieval needed
    if (["hi", "hey", "hello", "yo", "ok"].includes(key)) {
      return {
        success: true,
        answer: "Hello! How can I help you with your booking or event at Shubham Venue?",
        method: "greeting",
      };
    }

    // Return cached answer for repeated questions
    if (this.cache.has(key)) {
      return { ...this.cache.get(key), method: "cache" };
    }

    if (!this.documents.length) {
      return {
        success: false,
        answer: "The assistant isn't ready yet. Please try again in a moment.",
        method: "no-data",
      };
    }

    // Step 1: vector search (semantic)
    let docs = [];
    let method = "lunr";

    if (this.useVectorSearch && this.vectorStore) {
      try {
        const results = await Promise.race([
          this.vectorStore.similaritySearchWithScore(q, k),
          new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 3000)),
        ]);
        docs = results.filter(([, score]) => score < 0.75).map(([doc]) => doc);
        if (docs.length) method = "vector";
      } catch {
        // fall through to Lunr
      }
    }

    // Step 2: Lunr keyword search fallback
    if (!docs.length) {
      docs = this._lunrSearch(q, k);
    }

    if (!docs.length) {
      return {
        success: true,
        answer: "I couldn't find that in our FAQ. For help, contact us at hello@shubham.com or call +977 9812345678.",
        method: "no-match",
      };
    }

    // Step 3: LLM call with retrieved context
    const context = docs
      .slice(0, 3)
      .map((d) => d.pageContent.slice(0, 700))
      .join("\n\n")
      .slice(0, 2000);

    const prompt = `You are a helpful support assistant for Shubham Venue, an event venue in Waling, Syangja, Nepal.
Answer using ONLY the context provided. Be concise and friendly.
If the answer is not in the context, say: "Please contact us at hello@shubham.com or call +977 9812345678."

Context:
${context}

Question: ${q}
Answer:`;

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 8000);
      let response;
      try {
        response = await this.llm.invoke(prompt, { signal: controller.signal });
      } finally {
        clearTimeout(timer);
      }

      const result = { success: true, answer: response.content, method };
      if (this.cache.size < 200) this.cache.set(key, result);
      return result;
    } catch (err) {
      // LLM unavailable (quota / timeout) — serve Lunr answer directly, no crash
      console.warn("LLM unavailable, serving Lunr answer:", err.message);
      const answer = this._extractBestAnswer(docs, q);
      const result = { success: true, answer, method: "lunr-direct" };
      if (this.cache.size < 200) this.cache.set(key, result);
      return result;
    }
  }

  getDocumentCount() {
    return this.documents.length;
  }

  clearDocuments() {
    this.documents = [];
    this.vectorStore = null;
    this.lunrIndex = null;
    this.lunrDocs = new Map();
    this.useVectorSearch = false;
    this.cache.clear();
  }
}

export default new RAGService();
