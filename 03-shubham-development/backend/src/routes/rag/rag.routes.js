import express from "express";
import multer from "multer";
import ragService from "../../services/ragService.js";
import pdfParser from "../../utils/pdfParser.js";
import faqPdfGenerator from "../../utils/faqPdfGenerator.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FAQ_PDF_PATH = path.join(__dirname, "../../data/sample-faq.pdf");
const DATA_DIR = path.join(__dirname, "../../data");

const router = express.Router();

// Multer configuration for PDF uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// POST: Initialize RAG with sample FAQ
// Generates a PDF with FAQ content and loads it into the vector store
router.post("/initialize", async (req, res, next) => {
  try {
    // Ensure data directory exists
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    let faqText;

    // Check if FAQ PDF file exists
    if (fs.existsSync(FAQ_PDF_PATH)) {
      console.log("FAQ PDF found. Loading from file...");
      faqText = await pdfParser.extractTextFromFile(FAQ_PDF_PATH);
    } else {
      console.log("FAQ PDF not found. Generating new one...");
      await faqPdfGenerator.generatePDF(FAQ_PDF_PATH);
      faqText = await pdfParser.extractTextFromFile(FAQ_PDF_PATH);
    }

    // Load documents into RAG service
    // The loadDocuments method now handles the internal LangChain and Lunr setup
    await ragService.loadDocuments([faqText]);

    return res.json({
      success: true,
      message: "RAG initialized with sample FAQ",
      // Call the helper method from the class
      documentCount: ragService.getDocumentCount(), 
    });
  } catch (error) {
    console.error("Initialization Route Error:", error);
    next(error);
  }
});

// POST: Upload and process PDF files
// Accepts one or more PDF files and loads them into the vector store
router.post("/upload", upload.array("files", 5), async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No PDF files provided",
      });
    }

    const texts = [];

    // Extract text from each PDF
    for (const file of req.files) {
      const text = await pdfParser.extractTextFromBuffer(file.buffer);
      texts.push(text);
    }

    // Load all documents
    await ragService.loadDocuments(texts);

    return res.json({
      success: true,
      message: `Successfully loaded ${req.files.length} PDF(s)`,
      filesProcessed: req.files.map((f) => f.originalname),
      totalDocuments: ragService.getDocumentCount(),
    });
  } catch (error) {
    next(error);
  }
});

// POST: Query the RAG system (Chat Q&A)
// Retrieves relevant documents and generates an answer using Gemini
router.post("/query", async (req, res, next) => {
  try {
    const { question, topK = 3 } = req.body;

    if (!question?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Question required",
      });
    }

    console.log("QUERY HIT:", question);

    const result = await ragService.query(question, topK);

    console.log("QUERY DONE:", result.method);

    return res.json({
      success: true,
      question,
      answer: result.answer,
      sources: result.sources || [],
      method: result.method,
    });
  } catch (error) {
    console.error("Route error:", error);
    next(error);
  }
});
// GET: Search documents
// Semantic search across loaded documents
router.get("/search", async (req, res, next) => {
  try {
    const { query, limit = 5 } = req.query;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    if (ragService.getDocumentCount() === 0) {
      return res.status(400).json({
        success: false,
        message: "No documents loaded",
      });
    }

    const results = await ragService.searchDocuments(query, parseInt(limit));

    return res.json({
      success: true,
      query,
      resultsCount: results.length,
      results,
    });
  } catch (error) {
    next(error);
  }
});

// GET: System status
// Returns information about loaded documents and vector store status
router.get("/status", async (req, res, next) => {
  try {
    return res.json({
      success: true,
      initialized: ragService.initialized,
      documentsLoaded: ragService.getDocumentCount(),
      status: ragService.vectorStore ? "Ready" : "Not Ready",
    });
  } catch (error) {
    next(error);
  }
});

// POST: Generate sample FAQ PDF
// Generates the sample FAQ as a downloadable PDF file
router.post("/generate-faq-pdf", async (req, res, next) => {
  try {
    const pdfPath = await faqPdfGenerator.generateFAQPDF(
      "./sample-business-faq.pdf"
    );

    return res.json({
      success: true,
      message: "FAQ PDF generated successfully",
      path: pdfPath,
      note: "You can download this PDF and upload it using the /upload endpoint",
    });
  } catch (error) {
    next(error);
  }
});

// DELETE: Clear all documents
// Clears the vector store and loaded documents
router.delete("/clear", async (req, res, next) => {
  try {
    ragService.clearDocuments();

    return res.json({
      success: true,
      message: "All documents cleared",
    });
  } catch (error) {
    next(error);
  }
});

export default router;
