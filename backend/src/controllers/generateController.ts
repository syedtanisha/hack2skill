import { GenerationRequest, GenerationResponse } from '../types';
import { executeGeneration } from '../services/geminiService';

const VALID_TYPES = [
  'study-plan',
  'skill-gap',
  'coach-chat',
  'health-check',
  'material-extract',
  'material-analyze',
  'tutor-explain',
  'generate-quiz',
];
const MAX_PAYLOAD_SIZE = 15 * 1024 * 1024; // 15MB (accommodates up to 10MB base64 documents)

export async function handleGenerateRequest(
  body: any,
  apiKey?: string
): Promise<GenerationResponse> {
  // 1. Basic structural validation
  if (!body || typeof body !== 'object') {
    return {
      status: 400,
      data: {
        success: false,
        error: 'Invalid request body: Expected a JSON object.',
        isFallback: true,
        model: 'none',
      },
    };
  }

  // 2. Size limit check
  const approximateSize = JSON.stringify(body).length;
  if (approximateSize > MAX_PAYLOAD_SIZE) {
    return {
      status: 413,
      data: {
        success: false,
        error: `Payload Too Large: Request (${(approximateSize / (1024 * 1024)).toFixed(1)}MB) exceeds maximum limit (15MB).`,
        isFallback: true,
        model: 'none',
      },
    };
  }

  // 3. Type field validation
  const { type } = body as Partial<GenerationRequest>;
  if (!type || !VALID_TYPES.includes(type)) {
    return {
      status: 400,
      data: {
        success: false,
        error: `Invalid or missing 'type'. Supported operations: ${VALID_TYPES.join(', ')}.`,
        isFallback: true,
        model: 'none',
      },
    };
  }

  // 4. Operation-specific parameter validation
  if (type === 'coach-chat') {
    if (!body.message || typeof body.message !== 'string' || !body.message.trim()) {
      return {
        status: 400,
        data: {
          success: false,
          error: "Validation error: 'message' string is required for coach-chat.",
          isFallback: true,
          model: 'none',
        },
      };
    }
  }

  if (type === 'material-extract') {
    if (!body.fileBase64 || typeof body.fileBase64 !== 'string') {
      return {
        status: 400,
        data: {
          success: false,
          error: "Validation error: 'fileBase64' string is required for document extraction.",
          isFallback: true,
          model: 'none',
        },
      };
    }
    if (!body.fileName || typeof body.fileName !== 'string') {
      return {
        status: 400,
        data: {
          success: false,
          error: "Validation error: 'fileName' string is required for document extraction.",
          isFallback: true,
          model: 'none',
        },
      };
    }
  }

  if (type === 'tutor-explain' || type === 'generate-quiz') {
    if (!body.topic || typeof body.topic !== 'object' || !body.topic.title) {
      return {
        status: 400,
        data: {
          success: false,
          error: "Validation error: 'topic' object with 'title' is required for AI Tutor.",
          isFallback: true,
          model: 'none',
        },
      };
    }
  }

  if (type === 'study-plan' || type === 'skill-gap') {
    if (body.profile && typeof body.profile !== 'object') {
      return {
        status: 400,
        data: {
          success: false,
          error: "Validation error: 'profile' must be a valid student profile object.",
          isFallback: true,
          model: 'none',
        },
      };
    }
  }

  // 5. Delegate to Gemini Service
  try {
    return await executeGeneration(body as GenerationRequest, apiKey);
  } catch (err: any) {
    console.error('Controller execution error:', err);
    return {
      status: 500,
      data: {
        success: false,
        error: err.message || 'Internal server error processing generation.',
        isFallback: true,
        model: 'offline-engine',
      },
    };
  }
}
