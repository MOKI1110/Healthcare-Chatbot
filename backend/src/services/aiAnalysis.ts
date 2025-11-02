import axios from 'axios';
import { cleanModelText } from '../utils/cleanText';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

// Analyze image using Qwen Vision model
export async function analyzeImageWithAI(
  base64Image: string,
  mimeType: string,
  locale: string = 'en'
): Promise<string> {
  try {
    const response = await axios.post(
      `${OPENROUTER_BASE_URL}/chat/completions`,
      {
        model: 'qwen/qwen2.5-vl-32b-instruct:free',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful medical assistant analyzing images. Provide clear, compassionate analysis while noting you are not a replacement for professional medical advice.'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Please analyze this medical image or document. What do you see? Provide helpful observations and any relevant health information.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 1500,
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
      return 'I analyzed the image, but couldn\'t generate a detailed response. Could you provide more context about what you\'d like to know?';
    }

    return text;

  } catch (error: any) {
    console.error('Image analysis error:', error.response?.data || error.message);
    throw new Error('Failed to analyze image');
  }
}

// Analyze document text using Qwen model
export async function analyzeDocumentWithAI(
  documentText: string,
  fileName: string,
  locale: string = 'en'
): Promise<string> {
  try {
    // Truncate very long documents (Qwen can handle 32k tokens but let's be safe)
    const truncatedText = documentText.slice(0, 15000);
    const wordCount = documentText.split(/\s+/).length;

    const response = await axios.post(
      `${OPENROUTER_BASE_URL}/chat/completions`,
      {
        model: 'qwen/qwen2.5-vl-32b-instruct:free',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful medical assistant analyzing health documents. Provide clear summaries and highlight key medical information. Always remind users to consult healthcare professionals for medical decisions.'
          },
          {
            role: 'user',
            content: `I've uploaded a document called "${fileName}" with ${wordCount} words. Please analyze it and provide:
1. A brief summary
2. Key medical findings or information
3. Any important values, dates, or recommendations

Here is the document content:
---
${truncatedText}
---`
          }
        ],
        max_tokens: 2000,
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
      return `I've reviewed your document "${fileName}" (${wordCount} words), but couldn't generate a detailed analysis. What specific information are you looking for?`;
    }

    return text;

  } catch (error: any) {
    console.error('Document analysis error:', error.response?.data || error.message);
    throw new Error('Failed to analyze document');
  }
}
