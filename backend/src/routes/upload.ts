import { Router, type Request, type Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import mammoth from 'mammoth';
import { analyzeDocumentWithAI, analyzeImageWithAI } from '../services/aiAnalysis';

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, PDFs, and documents allowed.'));
    }
  }
});

// Extract text from PDF using pdf2json
async function extractPdfText(filePath: string): Promise<string> {
  const PDFParser = require('pdf2json');
  
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();
    
    pdfParser.on('pdfParser_dataError', (errData: any) => {
      reject(new Error(errData.parserError));
    });
    
    pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
      const text = pdfParser.getRawTextContent();
      resolve(text);
    });
    
    pdfParser.loadPDF(filePath);
  });
}

async function extractDocumentText(filePath: string, mimeType: string): Promise<string> {
  if (mimeType === 'application/pdf') {
    return await extractPdfText(filePath);
  } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
             mimeType === 'application/msword') {
    const buffer = fs.readFileSync(filePath);
    const result = await mammoth.extractRawText({ buffer });
    return result.value || '';
  } else if (mimeType === 'text/plain') {
    return fs.readFileSync(filePath, 'utf-8');
  } else {
    throw new Error('Unsupported document type');
  }
}

function imageToBase64(filePath: string): string {
  const buffer = fs.readFileSync(filePath);
  return buffer.toString('base64');
}

router.post('/', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    const { locale = 'en', sessionId } = req.body;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log(`File uploaded: ${file.originalname}, Size: ${file.size} bytes, Type: ${file.mimetype}`);

    const isImage = file.mimetype.startsWith('image/');
    let responseMessage = '';

    if (isImage) {
      const base64Image = imageToBase64(file.path);
      const mimeType = file.mimetype;
      responseMessage = await analyzeImageWithAI(base64Image, mimeType, locale);
    } else {
      const extractedText = await extractDocumentText(file.path, file.mimetype);
      
      if (!extractedText || extractedText.trim().length === 0) {
        responseMessage = `I received your file "${file.originalname}", but couldn't extract any text from it. Please ensure the document contains readable text.`;
      } else {
        console.log(`Extracted ${extractedText.length} characters from PDF`);
        responseMessage = await analyzeDocumentWithAI(extractedText, file.originalname, locale);
      }
    }

    res.json({
      message: responseMessage,
      fileId: file.filename,
      fileType: isImage ? 'image' : 'document',
      originalName: file.originalname
    });

  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: error.message || 'File upload failed',
      message: 'Sorry, I encountered an error processing your file. Please try again or upload a different file.'
    });
  }
});

export default router;
