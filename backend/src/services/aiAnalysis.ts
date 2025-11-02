import axios from 'axios';
import { cleanModelText } from '../utils/cleanText';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

const VISION_MODEL = 'nvidia/nemotron-nano-12b-v2-vl:free';

export async function analyzeImagesWithNvidia(
  base64Images: string[],
  fileName: string,
  locale: string = 'en',
  conversationHistory: any[] = [],
  isDocument: boolean = false
): Promise<{ analysis: string; isHealthRelated: boolean }> {
  try {
    const messages: any[] = [
      {
        role: 'system',
        content: `You are a helpful medical assistant with advanced vision and OCR capabilities. 

**IMPORTANT**: 
- If the document/image is NOT about health, medicine, wellness, medical research, or public health, clearly state this at the beginning.
- Start with: "⚠️ This document/image does not appear to be health-related."
- Then provide a brief description of what it actually shows.
- Do NOT try to find medical connections where none exist.

When analyzing health-related documents and images:
- Carefully read and extract ALL text from the image(s)
- Understand tables, charts, and formatted data
- Recognize medical terminology and values
- Provide clear, compassionate analysis
- Highlight key medical findings, test results, dates, and recommendations

You are NOT a replacement for professional medical advice.

Remember previous conversation context and refer to it when relevant.`
      }
    ];

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

    let promptText = '';
    
    if (isDocument) {
      promptText = `I've uploaded a document called "${fileName}" ${base64Images.length > 1 ? `with ${base64Images.length} pages` : ''}.

**First, determine if this document is about health, medicine, wellness, or medical topics.**

If YES (health-related):
1. Read and extract ALL text using your OCR capabilities
2. Provide a clear summary
3. Highlight key medical findings: test results, diagnoses, prescriptions, recommendations
4. Point out any concerning or abnormal values
5. Connect to any health concerns I mentioned earlier

If NO (not health-related):
1. Start with: "⚠️ This document does not appear to be health-related."
2. Briefly describe what the document is actually about
3. Suggest uploading a health-related document instead`;
    } else {
      promptText = `I've uploaded a medical image or scan called "${fileName}".

**First, determine if this is a health/medical image.**

If YES: Analyze carefully and provide helpful medical observations.
If NO: State that it's not health-related and describe what you see.`;
    }

    const content: any[] = [
      {
        type: 'text',
        text: promptText
      }
    ];

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

    console.log(`Sending ${fileName} (${base64Images.length} image(s)) to NVIDIA Nemotron for OCR + analysis`);

    const response = await axios.post(
      `${OPENROUTER_BASE_URL}/chat/completions`,
      {
        model: VISION_MODEL,
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
      return {
        analysis: `I received your file "${fileName}", but couldn't generate a detailed analysis. Could you provide more context about what you'd like to know?`,
        isHealthRelated: false
      };
    }

    const isHealthRelated = !text.includes('⚠️') && !text.toLowerCase().includes('not appear to be health-related');

    return {
      analysis: text,
      isHealthRelated: isHealthRelated
    };

  } catch (error: any) {
    console.error('NVIDIA Vision analysis error:', error.response?.data || error.message);
    
    if (error.response?.status === 429 || error.response?.data?.error?.code === 429) {
      return {
        analysis: `I'm experiencing high traffic right now. Please try again in a few moments.`,
        isHealthRelated: false
      };
    }
    
    if (error.response?.status === 400) {
      return {
        analysis: `I had trouble processing "${fileName}". The file might be too large or in an unsupported format. Try uploading individual pages or reducing the file size.`,
        isHealthRelated: false
      };
    }
    
    throw new Error('Failed to analyze file with NVIDIA Vision');
  }
}

export async function analyzeDocumentTextWithNvidia(
  documentText: string,
  fileName: string,
  locale: string = 'en',
  conversationHistory: any[] = []
): Promise<{ analysis: string; isHealthRelated: boolean }> {
  try {
    const messages: any[] = [
      {
        role: 'system',
        content: `You are a helpful medical assistant analyzing health documents.

**IMPORTANT**: 
- If the document is NOT about health, medicine, wellness, medical research, or public health, clearly state this at the beginning of your response.
- Start with: "⚠️ This document does not appear to be health-related."
- Then provide a brief summary of what it actually contains.
- Do NOT try to find medical connections where none exist.

If the document IS health-related:
- Provide clear summaries and highlight key medical information
- Point out test results, diagnoses, or recommendations
- Always remind users to consult healthcare professionals for medical decisions
- Remember previous conversation context`
      }
    ];

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

    const truncatedText = documentText.slice(0, 20000);
    const wordCount = documentText.split(/\s+/).length;

    messages.push({
      role: 'user',
      content: `I've uploaded a document called "${fileName}" with approximately ${wordCount} words.

**First, determine if this document is about health, medicine, wellness, or medical topics.**

If YES (health-related):
1. Provide a brief summary
2. Highlight key medical findings, test results, or important information
3. Point out any concerning values, dates, or recommendations
4. Connect to any health concerns I mentioned earlier

If NO (not health-related):
1. Start with: "⚠️ This document does not appear to be health-related."
2. Briefly describe what the document is actually about
3. Suggest uploading a health-related document instead

Here is the document content:
---
${truncatedText}
---`
    });

    console.log(`Sending document text (${wordCount} words) from ${fileName} to NVIDIA for analysis`);

    const response = await axios.post(
      `${OPENROUTER_BASE_URL}/chat/completions`,
      {
        model: VISION_MODEL,
        messages: messages,
        max_tokens: 2500,
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
      return {
        analysis: `I reviewed your document "${fileName}" (${wordCount} words), but couldn't generate a detailed analysis. What specific information are you looking for?`,
        isHealthRelated: false
      };
    }

    const isHealthRelated = !text.includes('⚠️') && !text.toLowerCase().includes('not appear to be health-related');

    return {
      analysis: text,
      isHealthRelated: isHealthRelated
    };

  } catch (error: any) {
    console.error('Document text analysis error:', error.response?.data || error.message);
    
    if (error.response?.status === 429 || error.response?.data?.error?.code === 429) {
      return {
        analysis: `I'm experiencing high traffic right now. Please try again in a few moments.`,
        isHealthRelated: false
      };
    }
    
    throw new Error('Failed to analyze document');
  }
}
