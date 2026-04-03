import { defineMiddleware } from 'astro:middleware';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const panelRoutes = new Set(['/projects', '/log', '/about']);
let indexHtml: string | null = null;

function getIndexHtml(): string {
  if (!indexHtml) {
    indexHtml = readFileSync(join(process.cwd(), 'dist/client/index.html'), 'utf-8');
  }
  return indexHtml;
}

export const onRequest = defineMiddleware((context, next) => {
  // Serve index.html for panel routes — client JS handles panel switching
  if (panelRoutes.has(context.url.pathname)) {
    return new Response(getIndexHtml(), {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
      },
    });
  }

  return next().then((response) => {
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    return response;
  });
});
