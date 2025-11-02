import axios from 'axios';
import { cleanModelText } from '../utils/cleanText';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

// Analyze images with Nemotron (handles OCR + analysis in one step)
export async function analyzeImagesWithQwen(
  base64Images: string[],
  fileName: string,
  locale: string = 'en',
  conversationHistory: any[] = [],
  isPDF: boolean = false
): Promise<string> {
  try {
    const messages: any[] = [
      {
        role: 'system',
        content: `You are a helpful medical assistant with advanced vision and OCR capabilities. 

When analyzing documents and images:
- First, carefully read and extract ALL text from the image(s)
- Understand tables, charts, and formatted data
- Recognize medical terminology and values
- Provide clear, compassionate analysis
- Highlight key medical findings, test results, dates, and recommendations
- Connect findings to any symptoms mentioned earlier in the conversation

You are NOT a replacement for professional medical advice. Always remind users to consult healthcare professionals for serious concerns.

Remember previous conversation context and refer to it when relevant.`
      }
    ];

    // Add conversation history
    if (conversationHistory && conversationHistory.length > 0) {
      conversationHistory.forEach(msg => {
        if (msg.role !== 'system') {
          messages.push({
            role: msg.role === 'assistant' ? 'assistant' : 'user',
            content: msg.content
          });
        }
      });
    }

    // Build prompt based on file type
    let promptText = '';
    
    if (isPDF) {
      promptText = `I've uploaded a PDF document called "${fileName}" ${base64Images.length > 1 ? `with ${base64Images.length} pages` : ''}.

This is likely a medical document (lab report, prescription, medical record, test results, etc.).

Please:
1. **Read and extract ALL text** from ${base64Images.length > 1 ? 'all pages' : 'this page'} using your OCR capabilities
2. Understand any tables, charts, or formatted data
3. Provide a **clear summary** of what this document contains
4. **Highlight key medical findings:** test results, diagnoses, prescriptions, recommendations
5. Point out any **concerning or abnormal values**
6. If I mentioned health concerns earlier, **connect this document to those concerns**

Please be thorough and extract all important information.`;
    } else {
      promptText = `I've uploaded a medical image or scan called "${fileName}".

Please analyze this image carefully. What do you see? Provide helpful observations and any relevant health information. If I mentioned symptoms earlier, relate your analysis to those concerns.`;
    }

    // Build content array with text + all images
    const content: any[] = [
      {
        type: 'text',
        text: promptText
      }
    ];

    // Add all images
    base64Images.forEach((base64Image) => {
      content.push({
        type: 'image_url',
        image_url: {
          url: `data:image/png;base64,${base64Image}`
        }
      });
    });

    messages.push({
      role: 'user',
      content: content
    });

    console.log(`Sending ${fileName} (${base64Images.length} image(s)) to Nemotron for OCR + analysis`);

    const response = await axios.post(
      `${OPENROUTER_BASE_URL}/chat/completions`,
      {
        model: 'nvidia/nemotron-nano-12b-v2-vl:free',
        messages: messages,
        max_tokens: 3000,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'Healthcare Chatbot'
        }
      }
    );

    let text = response.data?.choices?.[0]?.message?.content || '';
    text = cleanModelText(text);

    if (!text) {
      return `I received your file "${fileName}", but couldn't generate a detailed analysis. Could you provide more context about what you'd like to know?`;
    }

    return text;

  } catch (error: any) {
    console.error('Nemotron analysis error:', error.response?.data || error.message);
    
    if (error.response?.status === 400) {
      return `I had trouble processing "${fileName}". The file might be too large or in an unsupported format. Try uploading individual pages or reducing the file size.`;
    }
    
    throw new Error('Failed to analyze file with Nemotron');
  }
}
