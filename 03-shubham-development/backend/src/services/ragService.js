import {
  ChatGoogleGenerativeAI,
  GoogleGenerativeAIEmbeddings,
} from "@langchain/google-genai";

import {
  HarmBlockThreshold,
  HarmCategory,
} from "@google/generative-ai";

import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import lunr from "lunr";
import ENV from "../config/env.config.js";

/**
 * Lunr fallback search
 */
class LunrSearch {
  constructor() {
    this.index = null;
    this.documents = new Map();
  }

  async addDocuments(docs) {
    try {
      const self = this;

      this.index = lunr(function () {
        this.ref("id");
        this.field("content");

        docs.forEach((doc, idx) => {
          const id = idx.toString();
          this.add({ id, content: doc.pageContent });
          self.documents.set(id, doc);
        });
      });
    } catch (err) {
      console.error("Lunr error:", err.message);
    }
  }

  search(query, k = 3) {
    if (!this.index) return [];

    try {
      return this.index
        .search(query)
        .slice(0, k)
        .map((r) => this.documents.get(r.ref))
        .filter(Boolean);
    } catch {
      return [];
    }
  }
}

class RAGService {
  constructor() {
    this.model = null;
    this.embeddings = null;
    this.vectorStore = null;
    this.lunrSearch = new LunrSearch();
    this.documents = [];
    this.initialized = false;
    this.useVectorSearch = false;
    this.faqEmbeddingsCached = false; // New flag for caching
    this.lastApiCallTime = 0; // For rate limiting
    this.apiCallDelay = 1000; // 1 second delay between API calls
  }

  async initialize() {
    if (this.initialized) return;

    // ✅ FIXED EMBEDDING MODEL
    this.embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: ENV.GOOGLE_GEMINI_API_KEY,
      model: "gemini-embedding-001",
      maxRetries: 0, // Disable excessive retries
    });

    this.model = new ChatGoogleGenerativeAI({
      apiKey: ENV.GOOGLE_GEMINI_API_KEY,
      modelName: "gemini-2.0-flash-lite",
      temperature: 0.2,
      maxRetries: 0, // Disable excessive retries
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
      ],
    });

    this.initialized = true;
    console.log("✓ RAG initialized");
  }

  async ensureApiCallDelay() {
    const now = Date.now();
    const timeSinceLastCall = now - this.lastApiCallTime;
    if (timeSinceLastCall < this.apiCallDelay) {
      const delayNeeded = this.apiCallDelay - timeSinceLastCall;
      console.log(`Delaying API call for ${delayNeeded}ms to respect rate limits.`);
      await new Promise(resolve => setTimeout(resolve, delayNeeded));
    }
    this.lastApiCallTime = Date.now();
  }

  async loadDocuments(texts) {
    await this.initialize();

    if (this.faqEmbeddingsCached) {
      console.log("FAQ embeddings already cached. Skipping re-embedding.");
      return; // Skip if already cached
    }

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 400,
      chunkOverlap: 80,
    });

    const docs = await splitter.createDocuments(texts);
    this.documents = docs;

    console.log("📄 chunks:", docs.length);

    try {
      await this.ensureApiCallDelay(); // Add delay before embedding call
      this.vectorStore = await MemoryVectorStore.fromDocuments(
        docs,
        this.embeddings
      );
      this.useVectorSearch = true;
      this.faqEmbeddingsCached = true; // Mark as cached after successful embedding
    } catch (err) {
      console.warn("Vector store failed → Lunr fallback", err);
      this.useVectorSearch = false;
    }

    await this.lunrSearch.addDocuments(docs);

    console.log("✓ RAG ready");
  }

  async query(question, k = 3) {
    let relevantDocs = [];
    let method = "none";

    try {
      await this.initialize();

      if (!question || question.trim().length < 3) {
        return {
          success: true,
          answer: "Please ask a valid question.",
          method: "blocked-input",
        };
      }

      const cleaned = question.trim().toLowerCase();

      // ✅ FAST GREETING HANDLER (NO LLM)
      const junk = ["hi", "hey", "hello", "yo", "ok", "test"];
      if (junk.includes(cleaned)) {
        return {
          success: true,
          answer: "Hello 👋 How can I help you?",
          method: "intent-greeting",
        };
      }

      if (!this.documents.length) {
        return {
          success: false,
          answer: "No documents loaded.",
          method: "no-data",
        };
      }

      // 🔍 VECTOR SEARCH
      if (this.useVectorSearch && this.vectorStore) {
        try {
          const vectorSearchPromise = this.vectorStore.similaritySearchWithScore(
            question,
            k
          );

          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Vector search timed out")), 3000) // 3-second timeout
          );

          const results = await Promise.race([
            vectorSearchPromise,
            timeoutPromise,
          ]);

          relevantDocs = results
            .filter(([_, score]) => score < 0.75)
            .map(([doc]) => doc);

          if (relevantDocs.length) method = "vector";
        } catch (error) {
          console.warn("Vector search failed or timed out, falling back to Lunr:", error.message);
          relevantDocs = []; // Ensure no partial results are used
          method = "lunr"; // Explicitly set method to lunr for fallback
        }
      }

      // 🔁 LUNR fallback
      if (!relevantDocs.length) {
        relevantDocs = this.lunrSearch.search(question, k);
        if (relevantDocs.length) method = "lunr";
      }

      // ❌ NO MATCH → NO LLM
      if (!relevantDocs.length) {
        return {
          success: true,
          answer: "I couldn\"t find this in the FAQ.",
          method: "no-match",
        };
      }

      // 🧠 SAFE CONTEXT LIMIT
      const contextText = relevantDocs
        .slice(0, 3)
        .map((d) => d.pageContent.slice(0, 700))
        .join("\n\n")
        .slice(0, 2000);

      const prompt = `
You are a FAQ assistant.

RULES:
- Use ONLY the context
- If not found say "I don\"t know"

Context:
${contextText}

Question:
${question}

Answer:
`;

      // ✅ SAFE LLM CALL WITH ABORT CONTROLLER
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      let response;

      try {
        await this.ensureApiCallDelay(); // Re-add delay before LLM call
        response = await this.model.invoke(prompt, {
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeout);
      }

      return {
        success: true,
        answer: response.content,
        sources: relevantDocs.map((d) =>
          d.pageContent.substring(0, 120)
        ),
        method,
      };
    } catch (error) {
      console.error("Query Error:", error);

      // Hard Fallback: If LLM fails, return raw relevant document content
      if (relevantDocs && relevantDocs.length > 0) {
        const topDocumentContent = relevantDocs[0].pageContent;
        const qaPairs = this.extractQAPairs(topDocumentContent);
        let fallbackAnswer = "";

        // Try to find the most relevant Q&A pair
        let bestMatchQA = null;
        let maxScore = 0;

        for (const qa of qaPairs) {
          // Simple keyword matching for relevance
          const questionKeywords = question.toLowerCase().split(" ");
          const qaQuestionKeywords = qa.question.toLowerCase().split(" ");
          const qaAnswerKeywords = qa.answer.toLowerCase().split(" ");

          let currentScore = 0;
          questionKeywords.forEach(qK => {
            if (qaQuestionKeywords.includes(qK)) currentScore += 2; // Prioritize question match
            if (qaAnswerKeywords.includes(qK)) currentScore += 1;
          });

          if (currentScore > maxScore) {
            maxScore = currentScore;
            bestMatchQA = qa;
          }
        }

        if (bestMatchQA) {
          fallbackAnswer = `Q: ${bestMatchQA.question}\nA: ${bestMatchQA.answer}`;
        } else {
          // If no specific Q&A match, fall back to the first paragraph or a concise snippet
          const paragraphs = topDocumentContent.split(/\n\s*\n/);
          fallbackAnswer = paragraphs[0].trim().slice(0, 500); // Take first paragraph, or first 500 chars
        }

        return {
          success: true,
          answer: `I apologize, I couldn\"t process your request with the AI at the moment. Here\"s what I found in the FAQ: ${fallbackAnswer}`,
          sources: relevantDocs.map((d) =>
            d.pageContent.substring(0, 120)
          ),
          method: "hard-fallback",
        };
      }

      return {
        success: false,
        answer:
          "Service temporarily unavailable. Please try again.",
        error: error.message,
      };
    }
  }

  getDocumentCount() {
    return this.documents.length;
  }

  clearDocuments() {
    this.documents = [];
    this.vectorStore = null;
    this.lunrSearch = new LunrSearch();
    this.useVectorSearch = false;
    this.faqEmbeddingsCached = false; // Reset cache flag
  }

  // Helper to extract Q&A pairs from text
  extractQAPairs(text) {
    const qaPairs = [];
    const qaRegex = /Q:\s*(.*?)\s*A:\s*(.*?)(?=(?:\s*Q:|$))/gs;
    let match;
    while ((match = qaRegex.exec(text)) !== null) {
      qaPairs.push({
        question: match[1].trim(),
        answer: match[2].trim(),
      });
    }
    return qaPairs;
  }
}

export default new RAGService();