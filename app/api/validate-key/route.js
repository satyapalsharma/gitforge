import { validateApiKey } from '@/lib/gemini';

/**
 * POST /api/validate-key
 *
 * Validates a user-provided Gemini API key by making a test request.
 * Request body: { apiKey: string }
 * Response: { valid: boolean, error?: string }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { apiKey } = body;

    if (!apiKey || typeof apiKey !== 'string') {
      return Response.json(
        { valid: false, error: 'API key is required' },
        { status: 400 }
      );
    }

    // Trim whitespace from key
    const trimmedKey = apiKey.trim();
    if (trimmedKey.length === 0) {
      return Response.json(
        { valid: false, error: 'API key cannot be empty' },
        { status: 400 }
      );
    }

    const result = await validateApiKey(trimmedKey);

    return Response.json(result);
  } catch (error) {
    console.error('[validate-key] Unexpected error:', error);
    return Response.json(
      { valid: false, error: 'Failed to validate API key' },
      { status: 500 }
    );
  }
}
