/**
 * Document Indexer Utility
 * 
 * Helper functions to load and index medical documents into the RAG system
 */

import { indexDocuments, chunkDocument, DocumentChunk } from "../services/ragService";
import * as fs from "fs";
import * as path from "path";

// ============================================
// Load Healthcare Dataset from CSV
// ============================================

interface HealthcareQAPair {
  question: string;
  answer: string;
  category?: string;
  source?: string;
}

/**
 * Parse CSV file and convert to document chunks
 */
export async function loadHealthcareDatasetFromCSV(
  csvPath: string
): Promise<HealthcareQAPair[]> {
  try {
    // Read CSV file
    const csvContent = fs.readFileSync(csvPath, "utf-8");
    const lines = csvContent.split("\n").filter(line => line.trim());
    
    // Parse header
    const header = lines[0].split(",").map(h => h.trim().toLowerCase());
    const questionIdx = header.findIndex(h => h.includes("question"));
    const answerIdx = header.findIndex(h => h.includes("answer"));
    
    if (questionIdx === -1 || answerIdx === -1) {
      throw new Error("CSV must contain 'question' and 'answer' columns");
    }
    
    // Parse rows
    const pairs: HealthcareQAPair[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",");
      if (values.length > Math.max(questionIdx, answerIdx)) {
        pairs.push({
          question: values[questionIdx]?.trim() || "",
          answer: values[answerIdx]?.trim() || "",
          category: header.includes("category") 
            ? values[header.indexOf("category")]?.trim() 
            : undefined,
          source: "healthcare_dataset.csv",
        });
      }
    }
    
    return pairs.filter(p => p.question && p.answer);
  } catch (error: any) {
    console.error("[DocumentIndexer] Failed to load CSV:", error.message);
    throw error;
  }
}

/**
 * Index healthcare Q&A pairs as documents
 */
export async function indexHealthcareDataset(
  csvPath: string
): Promise<void> {
  try {
    console.log("[DocumentIndexer] Loading healthcare dataset...");
    const pairs = await loadHealthcareDatasetFromCSV(csvPath);
    
    // Convert Q&A pairs to documents
    const documents = pairs.map(pair => ({
      content: `Question: ${pair.question}\n\nAnswer: ${pair.answer}`,
      metadata: {
        source: pair.source || "healthcare_dataset",
        documentType: "general" as const,
        section: pair.category || "general",
      },
    }));
    
    console.log(`[DocumentIndexer] Indexing ${documents.length} Q&A pairs...`);
    await indexDocuments(documents);
    console.log("[DocumentIndexer] ✅ Dataset indexed successfully!");
  } catch (error: any) {
    console.error("[DocumentIndexer] Indexing failed:", error.message);
    throw error;
  }
}

// ============================================
// Load Medical Guidelines
// ============================================

/**
 * Load medical guidelines from text files
 */
export async function loadMedicalGuidelines(
  guidelinesDir: string
): Promise<void> {
  try {
    const files = fs.readdirSync(guidelinesDir);
    const documents: Array<{ content: string; metadata: DocumentChunk["metadata"] }> = [];
    
    for (const file of files) {
      if (file.endsWith(".txt") || file.endsWith(".md")) {
        const filePath = path.join(guidelinesDir, file);
        const content = fs.readFileSync(filePath, "utf-8");
        
        documents.push({
          content,
          metadata: {
            source: file,
            documentType: "guideline",
            timestamp: new Date().toISOString(),
          },
        });
      }
    }
    
    if (documents.length > 0) {
      console.log(`[DocumentIndexer] Indexing ${documents.length} medical guidelines...`);
      await indexDocuments(documents);
      console.log("[DocumentIndexer] ✅ Guidelines indexed successfully!");
    }
  } catch (error: any) {
    console.error("[DocumentIndexer] Failed to load guidelines:", error.message);
  }
}

// ============================================
// Initialize RAG System
// ============================================

/**
 * Initialize RAG system with default healthcare dataset
 */
export async function initializeRAGSystem(): Promise<void> {
  try {
    // Try to load healthcare dataset if it exists
    const datasetPath = path.join(__dirname, "../../../rag/healthcare_dataset.csv");
    if (fs.existsSync(datasetPath)) {
      await indexHealthcareDataset(datasetPath);
    } else {
      console.log("[DocumentIndexer] Healthcare dataset not found. RAG system will start empty.");
      console.log("[DocumentIndexer] Use indexDocuments() to add documents programmatically.");
    }
  } catch (error: any) {
    console.error("[DocumentIndexer] Initialization failed:", error.message);
  }
}

export default {
  loadHealthcareDatasetFromCSV,
  indexHealthcareDataset,
  loadMedicalGuidelines,
  initializeRAGSystem,
};

