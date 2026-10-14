import { handleGenerateRequest } from '../controllers/generateController';
import { GenerationResponse } from '../types';

/**
 * Route handler for POST /api/generate
 */
export async function handleGenerateRoute(
  body: any,
  apiKey?: string
): Promise<GenerationResponse> {
  return await handleGenerateRequest(body, apiKey);
}
