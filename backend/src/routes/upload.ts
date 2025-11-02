import { Router, type Request, type Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { analyzeImagesWithNvidia, analyzeDocumentTextWithNvidia } from '../services/aiAnalysis';

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
    const mimetype = allowedTypes.test(file.mimetype) || 
                     file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                     file.mimetype === 'application/msword';
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, PDFs, and Word documents allowed.'));
    }
  }
});

async function convertPdfToBase64Images(pdfPath: string): Promise<string[]> {
  const { pdf } = require('pdf-to-img');
  const base64Images: string[] = [];
  
  try {
    console.log('Converting PDF pages to images...');
    
    const document = await pdf(pdfPath, { scale: 2.0 });
    
    for await (const image of document) {
      const base64 = image.toString('base64');
      base64Images.push(base64);
      
      if (base64Images.length >= 5) {
        console.log('Limiting to first 5 pages');
        break;
      }
    }
    
    console.log(`Converted ${base64Images.length} page(s) to images`);
    return base64Images;
    
  } catch (error) {
    console.error('PDF to image conversion error:', error);
    throw new Error('Failed to convert PDF to images');
  }
}

async function extractDocxText(docxPath: string): Promise<string> {
  const mammoth = require('mammoth');
  
  try {
    console.log('Extracting text from DOCX...');
    const result = await mammoth.extractRawText({ path: docxPath });
    const text = result.value || '';
    console.log(`Extracted ${text.length} characters from DOCX`);
    return text;
  } catch (error) {
    console.error('DOCX text extraction error:', error);
    throw new Error('Failed to extract text from DOCX');
  }
}

function imageToBase64(filePath: string): string {
  const buffer = fs.readFileSync(filePath);
  return buffer.toString('base64');
}

router.post('/', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    const { locale = 'en', sessionId, conversationHistory } = req.body;

    let history = [];
    if (conversationHistory) {
      history = typeof conversationHistory === 'string' 
        ? JSON.parse(conversationHistory) 
        : conversationHistory;
    }

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log(`File uploaded: ${file.originalname}, Size: ${file.size} bytes, Type: ${file.mimetype}`);
    console.log(`Conversation history length: ${history.length}`);

    let responseMessage = '';
    let isHealthRelated = false;
    
    const isPDF = file.mimetype === 'application/pdf';
    const isImage = file.mimetype.startsWith('image/');
    const isDocx = file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    const isDoc = file.mimetype === 'application/msword';
    const isText = file.mimetype === 'text/plain';

    if (isPDF) {
      const pdfImages = await convertPdfToBase64Images(file.path);
      
      if (pdfImages.length === 0) {
        responseMessage = `I received your PDF "${file.originalname}", but couldn't convert it to readable images. Please try a different file.`;
      } else {
        const result = await analyzeImagesWithNvidia(
          pdfImages,
          file.originalname,
          locale,
          history,
          true
        );
        responseMessage = result.analysis;
        isHealthRelated = result.isHealthRelated;
      }
      
    } else if (isDocx || isDoc) {
      const docText = await extractDocxText(file.path);
      
      if (!docText || docText.trim().length === 0) {
        responseMessage = `I received your document "${file.originalname}", but couldn't extract any text from it.`;
      } else {
        const result = await analyzeDocumentTextWithNvidia(
          docText,
          file.originalname,
          locale,
          history
        );
        responseMessage = result.analysis;
        isHealthRelated = result.isHealthRelated;
      }
      
    } else if (isText) {
      const textContent = fs.readFileSync(file.path, 'utf-8');
      
      if (!textContent || textContent.trim().length === 0) {
        responseMessage = `I received your text file "${file.originalname}", but it appears to be empty.`;
      } else {
        const result = await analyzeDocumentTextWithNvidia(
          textContent,
          file.originalname,
          locale,
          history
        );
        responseMessage = result.analysis;
        isHealthRelated = result.isHealthRelated;
      }
      
    } else if (isImage) {
      const base64Image = imageToBase64(file.path);
      const result = await analyzeImagesWithNvidia(
        [base64Image],
        file.originalname,
        locale,
        history,
        false
      );
      responseMessage = result.analysis;
      isHealthRelated = result.isHealthRelated;
      
    } else {
      responseMessage = `File type ${file.mimetype} is not yet supported. Please upload images, PDFs, Word documents, or text files.`;
    }

    res.json({
      message: responseMessage,
      fileId: file.filename,
      fileType: isPDF || isImage || isDocx || isDoc || isText ? 'document' : 'other',
      originalName: file.originalname,
      isHealthRelated: isHealthRelated
    });

  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: error.message || 'File upload failed',
      message: 'Sorry, I encountered an error processing your file. Please try again or upload a different file.',
      isHealthRelated: false
    });
  }
});

export default router;
