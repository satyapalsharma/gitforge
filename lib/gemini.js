const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash';

/**
 * Make a request to the Gemini API.
 * @param {string} apiKey - User's Gemini API key
 * @param {string} endpoint - API endpoint (e.g. :generateContent)
 * @param {object} body - Request body
 * @returns {Promise<object>} Parsed JSON response
 */
async function geminiFetch(apiKey, endpoint, body) {
  const url = `${GEMINI_BASE}${endpoint}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    const errorMessage = data.error?.message || `Gemini API error: ${res.status}`;
    console.error(`[Gemini] ${endpoint} → ${res.status}:`, errorMessage);
    throw new Error(errorMessage);
  }

  return data;
}

/**
 * Extract text content from a Gemini response.
 * @param {object} response - Gemini API response
 * @returns {string} Extracted text
 */
function extractText(response) {
  const candidate = response.candidates?.[0];
  if (!candidate) {
    throw new Error('No response generated from Gemini');
  }
  return candidate.content?.parts?.map((p) => p.text).join('') || '';
}

/**
 * Validate a Gemini API key by making a small test request.
 * @param {string} apiKey - Gemini API key to validate
 * @returns {Promise<{valid: boolean, error?: string}>}
 */
export async function validateApiKey(apiKey) {
  try {
    await geminiFetch(apiKey, ':generateContent', {
      contents: [
        {
          parts: [{ text: 'Say "ok"' }],
        },
      ],
      generationConfig: {
        maxOutputTokens: 5,
      },
    });
    return { valid: true };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

/**
 * Generate a project file structure using Gemini.
 * @param {string} apiKey - Gemini API key
 * @param {string} projectName - Name of the project
 * @param {string} description - Project description
 * @param {string[]} techStack - Technologies used
 * @returns {Promise<Array<{path: string, description: string}>>} Array of file paths with descriptions
 */
export async function generateProjectStructure(apiKey, projectName, description, techStack) {
  const prompt = `You are a senior developer. Generate a realistic file structure for a project.

Project: ${projectName}
Description: ${description}
Tech Stack: ${techStack.join(', ')}

Return ONLY a valid JSON array of objects with "path" and "description" fields.
Include common files like README.md, .gitignore, package.json (or equivalent), source files, config files, etc.
Keep it realistic — a ${description} project typically has 5-15 files.

Example format:
[
  {"path": "README.md", "description": "Project documentation"},
  {"path": "src/index.js", "description": "Entry point"}
]

Return ONLY the JSON array, no markdown fences, no explanation.`;

  const response = await geminiFetch(apiKey, ':generateContent', {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 2048,
    },
  });

  const text = extractText(response);

  try {
    // Strip markdown code fences if present
    const cleaned = text.replace(/```(?:json)?\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch (parseError) {
    console.error('[Gemini] Failed to parse project structure:', text);
    throw new Error('Failed to parse project structure from Gemini response');
  }
}

/**
 * Generate content for a single file using Gemini.
 * @param {string} apiKey - Gemini API key
 * @param {string} projectName - Name of the project
 * @param {string} filePath - File path (e.g. "src/index.js")
 * @param {string} projectContext - Description of the overall project and its structure
 * @returns {Promise<string>} Generated file content
 */
export async function generateFileContent(apiKey, projectName, filePath, projectContext) {
  const prompt = `You are a senior developer writing production-quality code.

Project: ${projectName}
File: ${filePath}
Project Context: ${projectContext}

Generate the complete content for this file. Requirements:
- Write clean, well-commented, production-ready code
- Include proper imports/requires
- Follow best practices for the language/framework
- Make the code functional and realistic (not just boilerplate)
- Include helpful comments explaining key sections

Return ONLY the raw file content. No markdown fences, no explanations before or after.`;

  const response = await geminiFetch(apiKey, ':generateContent', {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 4096,
    },
  });

  return extractText(response);
}

/**
 * Estimate token count for a given prompt.
 * @param {string} apiKey - Gemini API key
 * @param {string} prompt - Text to count tokens for
 * @returns {Promise<number>} Token count
 */
export async function estimateTokens(apiKey, prompt) {
  const response = await geminiFetch(apiKey, ':countTokens', {
    contents: [{ parts: [{ text: prompt }] }],
  });

  return response.totalTokens;
}

/**
 * Generic code generation with Gemini.
 * @param {string} apiKey - Gemini API key
 * @param {string} prompt - Generation prompt
 * @returns {Promise<string>} Generated text
 */
export async function generateCode(apiKey, prompt) {
  const response = await geminiFetch(apiKey, ':generateContent', {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 4096,
    },
  });

  return extractText(response);
}
