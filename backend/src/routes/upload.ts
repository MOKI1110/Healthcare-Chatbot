import { Router, type Request, type Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { analyzeImagesWithQwen } from '../services/aiAnalysis';

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
    const allowedTypes = /jpeg|jpg|png|gif|pdf|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, PDFs, and text files allowed.'));
    }
  }
});

// Convert PDF to images (base64)
async function convertPdfToBase64Images(pdfPath: string): Promise<string[]> {
  const { pdf } = require('pdf-to-img');
  const base64Images: string[] = [];
  
  try {
    console.log('Converting PDF pages to images...');
    
    const document = await pdf(pdfPath, { scale: 2.0 }); // Higher scale = better quality
    
    for await (const image of document) {
      const base64 = image.toString('base64');
      base64Images.push(base64);
      
      // Limit to first 5 pages to avoid huge payloads
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

// Convert single image file to base64
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
    const isPDF = file.mimetype === 'application/pdf';
    const isImage = file.mimetype.startsWith('image/');

    if (isPDF) {
      // Convert PDF to images, let Qwen do OCR + analysis
      const pdfImages = await convertPdfToBase64Images(file.path);
      
      if (pdfImages.length === 0) {
        responseMessage = `I received your PDF "${file.originalname}", but couldn't convert it to readable images. Please try a different file.`;
      } else {
        responseMessage = await analyzeImagesWithQwen(
          pdfImages,
          file.originalname,
          locale,
          history,
          true // isPDF flag
        );
      }
      
    } else if (isImage) {
      // Single image upload
      const base64Image = imageToBase64(file.path);
      responseMessage = await analyzeImagesWithQwen(
        [base64Image],
        file.originalname,
        locale,
        history,
        false // not a PDF
      );
      
    } else {
      responseMessage = `File type ${file.mimetype} is not yet supported. Please upload images or PDFs.`;
    }

    res.json({
      message: responseMessage,
      fileId: file.filename,
      fileType: isPDF || isImage ? 'document' : 'other',
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
