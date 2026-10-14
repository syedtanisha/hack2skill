import { handleGeneration } from '../src/server/geminiService';

export default async function handler(req: any, res: any) {
  // Set CORS headers for security and flexibility
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const result = await handleGeneration(body, apiKey);
    return res.status(result.status).json(result.data);
  } catch (error: any) {
    console.error('Vercel API execution error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      isFallback: true,
      model: 'offline-engine',
    });
  }
}
