import { GenerationRequest, GenerationResponse } from '../types';
import { executeGeneration } from '../services/geminiService';

const VALID_TYPES = ['study-plan', 'skill-gap', 'coach-chat', 'health-check'];
const MAX_PAYLOAD_SIZE = 500000; // 500KB

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
        error: 'Payload Too Large: Request exceeds maximum size limit (500KB).',
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
