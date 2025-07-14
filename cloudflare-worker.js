// Cloudflare Worker for L'Oreal Routine Builder
// Handles requests from the web app and securely forwards to OpenAI or other APIs
// Supports multiple endpoints for future expansion

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const { pathname } = url;

    // Only allow POST requests
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (err) {
      return new Response('Invalid JSON', { status: 400 });
    }

    // Choose endpoint based on path
    let endpoint = '';
    if (pathname === '/web-search') {
      // Example: Use a web search API here
      endpoint = 'https://api.perplexity.ai/v1/chat/completions'; // Replace with your web search API
    } else {
      // Default: OpenAI chat completions
      endpoint = 'https://api.openai.com/v1/chat/completions';
    }

    // Forward request to the chosen endpoint
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.OPENAI_API_KEY}` // Store your key in Worker environment variables
      },
      body: JSON.stringify(body)
    });

    // Return the response from OpenAI (or other API)
    return new Response(await response.text(), {
      status: response.status,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
