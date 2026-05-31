/**
 * Make a request to the Gemini API.
 * @param {string} apiKey - User's Gemini API key
 * @param {string} model - Model name (e.g. 'gemini-3.5-flash' or 'gemini-3.1-pro')
 * @param {string} endpoint - API endpoint (e.g. :generateContent)
 * @param {object} body - Request body
 * @returns {Promise<object>} Parsed JSON response
 */
async function geminiFetch(apiKey, model, endpoint, body) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}${endpoint}`;
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
    await geminiFetch(apiKey, 'gemini-2.5-flash', ':generateContent', {
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
 * @param {string} complexity - Project complexity
 * @param {string} interconnectivityContext - Context about other projects in the session
 * @returns {Promise<Array<{path: string, description: string}>>} Array of file paths with descriptions
 */
export async function generateProjectStructure(apiKey, projectName, description, techStack, complexity = 'medium', interconnectivityContext = '') {
  const model = complexity === 'very-complex' ? 'gemini-2.5-pro' : 'gemini-2.5-flash';
  const prompt = `You are a senior developer. Generate a realistic file structure for a project.

Project: ${projectName}
Description: ${description}
Tech Stack: ${techStack.join(', ')}
${interconnectivityContext ? `Context: ${interconnectivityContext}` : ''}

Return ONLY a valid JSON array of objects with "path" and "description" fields.
Include common files like README.md, .gitignore, package.json (or equivalent), source files, config files, etc.
CRITICAL: You MUST include at least one GitHub Actions workflow file (e.g., \`.github/workflows/ci.yml\`) to simulate CI/CD pipelines.
Keep it realistic — a ${description} project typically has 5-15 files.

Example format:
[
  {"path": "README.md", "description": "Project documentation"},
  {"path": "src/index.js", "description": "Entry point"}
]

Return ONLY the JSON array, no markdown fences, no explanation.`;

  const response = await geminiFetch(apiKey, model, ':generateContent', {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: complexity === 'very-complex' ? 4096 : 2048,
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
 * @param {string} filePath - Path of the file to generate
 * @param {string} projectContext - Context string (description, tech stack, file list)
 * @param {string} complexity - Project complexity
 * @param {string} interconnectivityContext - Context about other projects in the session
 * @returns {Promise<string>} Generated file content
 */
export async function generateFileContent(apiKey, projectName, filePath, projectContext, complexity = 'medium', interconnectivityContext = '') {
  const model = complexity === 'very-complex' ? 'gemini-2.5-pro' : 'gemini-2.5-flash';
  const prompt = `You are a senior developer writing production-quality code.

Project: ${projectContext}
${interconnectivityContext ? `\nCross-Project Context: ${interconnectivityContext}` : ''}

File to generate: ${filePath}
Project Context: ${projectContext}

Generate the complete content for this file. Requirements:
- Write clean, well-commented, production-ready code
- Include proper imports/requires
- Follow best practices for the language/framework
- Make the code functional and realistic (not just boilerplate)
Return ONLY the raw file content. No markdown fences, no explanations before or after.

CRITICAL INSTRUCTIONS FOR README.md:
If this file is README.md, you MUST make it extremely polished. Include:
1. A hero section with a title and description.
2. Shields.io badges for the tech stack (e.g. ![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)).
3. A Mermaid.js architecture or flow diagram (\`\`\`mermaid ... \`\`\`).
4. Detailed "Features", "Installation", and "Usage" sections.
5. Do NOT include markdown code fences (like \`\`\`markdown) at the very start/end of your response, just the raw markdown content.`;

  const response = await geminiFetch(apiKey, model, ':generateContent', {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: complexity === 'very-complex' ? 8192 : 4096,
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
  const response = await geminiFetch(apiKey, 'gemini-2.5-flash', ':countTokens', {
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
  const response = await geminiFetch(apiKey, 'gemini-2.5-flash', ':generateContent', {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.2,
    },
  });

  return extractText(response);
}

/**
 * Generate realistic GitHub issues for the project.
 * @param {string} apiKey - Gemini API Key
 * @param {string} projectName - Project name
 * @param {string} description - Project description
 * @param {string[]} techStack - Tech stack array
 * @returns {Promise<Array<{title: string, body: string, labels: string[]}>>}
 */
export async function generateFakeIssues(apiKey, projectName, description, techStack) {
  const prompt = `You are a project manager. Generate 3 realistic open GitHub issues for a new project.
  
Project: ${projectName}
Description: ${description}
Tech Stack: ${techStack.join(', ')}

Return ONLY a valid JSON array of objects with "title", "body" (markdown), and "labels" (array of strings like ["enhancement", "help wanted"]). No fences or explanations.`;

  const response = await geminiFetch(apiKey, 'gemini-2.5-flash', ':generateContent', {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.7 },
  });

  const text = extractText(response);
  const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('Failed to parse fake issues JSON:', cleaned);
    return [];
  }
}
