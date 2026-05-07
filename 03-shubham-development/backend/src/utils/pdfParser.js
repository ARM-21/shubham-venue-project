import fs from "fs/promises";
import pdf from "pdf-parse";

class PDFParser {
  async extractTextFromFile(filePath) {
    try {
      const buffer = await fs.readFile(filePath);
      const data = await pdf(buffer);

      return data.text;
    } catch (error) {
      console.error("Error parsing PDF:", error);
      throw new Error("Failed to extract PDF text");
    }
  }

  async extractMetadata(filePath) {
    try {
      const buffer = await fs.readFile(filePath);
      const data = await pdf(buffer);

      return {
        numPages: data.numpages || 0,
        title: data.info?.Title || "Untitled",
        author: data.info?.Author || "Unknown",
      };
    } catch (error) {
      console.error("Error extracting metadata:", error);
      throw new Error("Failed to extract PDF metadata");
    }
  }

  async extractTextFromBuffer(buffer) {
    try {
      const data = await pdf(buffer);
      return data.text;
    } catch (error) {
      console.error("Error parsing PDF buffer:", error);
      throw new Error("Failed to extract PDF text from buffer");
    }
  }
}

export default new PDFParser();