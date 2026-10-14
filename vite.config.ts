import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import type { IncomingMessage, ServerResponse } from 'http';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      {
        name: 'api-generate-dev-middleware',
        configureServer(server) {
          server.middlewares.use('/api/generate', async (req: IncomingMessage, res: ServerResponse) => {
            if (req.method !== 'POST') {
              res.statusCode = 405;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Method not allowed' }));
              return;
            }

            let bodyStr = '';
            req.on('data', chunk => {
              bodyStr += chunk;
              if (bodyStr.length > 500000) {
                res.statusCode = 413;
                res.end(JSON.stringify({ error: 'Payload too large' }));
                req.destroy();
              }
            });

            req.on('end', async () => {
              try {
                const body = JSON.parse(bodyStr || '{}');
                const apiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;

                // Dynamically load the TypeScript handler via Vite SSR
                const { handleGeneration } = await server.ssrLoadModule('./src/server/geminiService.ts');
                const result = await handleGeneration(body, apiKey);

                res.statusCode = result.status || 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(result.data));
              } catch (err: any) {
                console.error('Dev server API error:', err);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                  error: err.message || 'Internal server error',
                  isFallback: true
                }));
              }
            });
          });
        }
      }
    ],
    server: {
      port: 5173,
      open: false,
    }
  };
});
