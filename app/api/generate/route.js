import { auth } from '@/lib/auth';
import { createRepo, createBackdatedCommit, getUserEmails } from '@/lib/github';
import { generateProjectStructure, generateFileContent } from '@/lib/gemini';
import { scheduleCommits } from '@/lib/commit-scheduler';

/**
 * POST /api/generate
 *
 * Main generation pipeline. Creates GitHub repos with backdated commits
 * using AI-generated code. Streams progress updates to the client.
 *
 * Request body:
 * {
 *   projects: [{ name, description, techStack }],
 *   startDate: "2024-01-01",
 *   endDate: "2024-12-31",
 *   geminiApiKey: "user-key"
 * }
 *
 * Response: Server-Sent Events (SSE) stream with progress updates
 */
export async function POST(request) {
  // 1. Authenticate the user
  const session = await auth();
  if (!session?.accessToken) {
    return Response.json(
      { error: 'Authentication required. Please sign in with GitHub.' },
      { status: 401 }
    );
  }

  // 2. Parse and validate the request body
  let body;
  try {
    body = await request.json();
  } catch (error) {
    return Response.json(
      { error: 'Invalid JSON in request body' },
      { status: 400 }
    );
  }

  const { projects, startDate, endDate, geminiApiKey, persona = 'professional', scheduleProfile = 'balanced' } = body;

  if (!projects || !Array.isArray(projects) || projects.length === 0) {
    return Response.json(
      { error: 'projects array is required and must not be empty' },
      { status: 400 }
    );
  }

  if (!startDate || !endDate) {
    return Response.json(
      { error: 'startDate and endDate are required' },
      { status: 400 }
    );
  }

  if (!geminiApiKey || typeof geminiApiKey !== 'string') {
    return Response.json(
      { error: 'geminiApiKey is required' },
      { status: 400 }
    );
  }

  // Validate date range
  if (new Date(startDate) >= new Date(endDate)) {
    return Response.json(
      { error: 'startDate must be before endDate' },
      { status: 400 }
    );
  }

  const accessToken = session.accessToken;
  const owner = session.user.githubUsername;

  // 3. Set up streaming response
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      /**
       * Send a progress event to the client.
       * @param {object} data - Event data to send
       */
      function sendEvent(data) {
        const payload = `data: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(payload));
      }

      try {
        // Fetch the user's verified email — CRITICAL for contribution graph
        // GitHub only counts commits when email matches a verified account email
        let userEmail;
        try {
          userEmail = await getUserEmails(accessToken);
          console.log(`[generate] Using verified email: ${userEmail}`);
        } catch (emailError) {
          console.warn('[generate] Could not fetch verified email, falling back to noreply');
          userEmail = `${owner}@users.noreply.github.com`;
        }

        if (!userEmail) {
          userEmail = `${owner}@users.noreply.github.com`;
        }

        sendEvent({
          type: 'progress',
          step: 'init',
          message: `Using email: ${userEmail} for commits`,
          progress: 0,
        });

        const totalProjects = projects.length;

        for (let pi = 0; pi < totalProjects; pi++) {
          const project = projects[pi];
          const { name, description, techStack } = project;
          const repoName = name.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');

          sendEvent({
            type: 'progress',
            project: repoName,
            step: 'starting',
            message: `Starting project: ${name}`,
            projectIndex: pi + 1,
            totalProjects,
            progress: Math.round(((pi) / totalProjects) * 100),
            projectProgress: 0,
          });

          // 3a. Generate project structure via Gemini
          sendEvent({
            type: 'progress',
            project: repoName,
            step: 'generating-structure',
            message: 'Generating project structure...',
            progress: Math.round(((pi + 0.1) / totalProjects) * 100),
            projectProgress: 5,
          });

          let fileStructure;
          try {
            fileStructure = await generateProjectStructure(
              geminiApiKey,
              name,
              description,
              techStack || [],
              project.estimatedComplexity || 'medium'
            );
          } catch (error) {
            sendEvent({
              type: 'error',
              project: repoName,
              message: `Failed to generate structure: ${error.message}`,
            });
            continue; // Skip this project, continue with next
          }

          // 3b. Generate file contents via Gemini
          const projectContext = `Project: ${name}\nDescription: ${description}\nTech Stack: ${(techStack || []).join(', ')}\nFiles: ${fileStructure.map((f) => f.path).join(', ')}`;

          const generatedFiles = [];
          for (let fi = 0; fi < fileStructure.length; fi++) {
            const file = fileStructure[fi];

            sendEvent({
              type: 'progress',
              project: repoName,
              step: 'generating',
              file: file.path,
              message: `Generating ${file.path}...`,
              fileIndex: fi + 1,
              totalFiles: fileStructure.length,
              progress: Math.round(((pi + 0.2 + (0.4 * fi / fileStructure.length)) / totalProjects) * 100),
              projectProgress: Math.round(10 + (50 * (fi + 1) / fileStructure.length)),
            });

            try {
              const content = await generateFileContent(
                geminiApiKey,
                name,
                file.path,
                projectContext,
                project.estimatedComplexity || 'medium'
              );

              generatedFiles.push({
                path: file.path,
                content,
              });
            } catch (error) {
              console.error(`[generate] Failed to generate ${file.path}:`, error);
              sendEvent({
                type: 'warning',
                project: repoName,
                file: file.path,
                message: `Skipped ${file.path}: ${error.message}`,
              });
            }
          }

          if (generatedFiles.length === 0) {
            sendEvent({
              type: 'error',
              project: repoName,
              message: 'No files were generated. Skipping repo creation.',
            });
            continue;
          }

          // 3c. Create a GitHub repo
          sendEvent({
            type: 'progress',
            project: repoName,
            step: 'creating-repo',
            message: `Creating GitHub repository: ${repoName}...`,
            progress: Math.round(((pi + 0.65) / totalProjects) * 100),
            projectProgress: 60,
          });

          let repo;
          try {
            repo = await createRepo(accessToken, repoName, description);
          } catch (error) {
            sendEvent({
              type: 'error',
              project: repoName,
              message: `Failed to create repo: ${error.message}`,
            });
            continue;
          }

          // Wait a moment for GitHub to initialize the repo
          await sleep(2000);

          // 3d. Schedule commits across date range
          const totalCommits = Math.max(
            3,
            Math.ceil(generatedFiles.length / 2) + 2
          );
          const commitDates = scheduleCommits(startDate, endDate, totalCommits, scheduleProfile);

          // 3e. Push backdated commits with generated files
          sendEvent({
            type: 'progress',
            project: repoName,
            step: 'committing',
            message: `Pushing ${commitDates.length} backdated commits...`,
            progress: Math.round(((pi + 0.7) / totalProjects) * 100),
            projectProgress: 65,
          });

          // Distribute files across commits
          const filesPerCommit = distributeFiles(generatedFiles, commitDates.length);

          for (let ci = 0; ci < commitDates.length; ci++) {
            const commitFiles = filesPerCommit[ci];
            if (!commitFiles || commitFiles.length === 0) continue;

            const commitMessage = generateCommitMessage(commitFiles, ci === 0, persona);
            const commitDate = commitDates[ci];

            try {
              await createBackdatedCommit(
                accessToken,
                owner,
                repoName,
                commitFiles,
                commitMessage,
                commitDate,
                userEmail
              );

              sendEvent({
                type: 'progress',
                project: repoName,
                step: 'committing',
                message: `Commit ${ci + 1}/${commitDates.length}: ${commitMessage}`,
                commitIndex: ci + 1,
                totalCommits: commitDates.length,
                progress: Math.round(((pi + 0.7 + (0.3 * (ci + 1) / commitDates.length)) / totalProjects) * 100),
                projectProgress: Math.round(65 + (35 * (ci + 1) / commitDates.length)),
              });

              // Small delay between commits to avoid rate limiting
              await sleep(500);
            } catch (error) {
              console.error(`[generate] Commit ${ci + 1} failed:`, error);
              sendEvent({
                type: 'warning',
                project: repoName,
                message: `Commit ${ci + 1} failed: ${error.message}`,
              });
            }
          }

          sendEvent({
            type: 'project-complete',
            project: repoName,
            repoUrl: repo.html_url,
            message: `Completed: ${name}`,
            filesGenerated: generatedFiles.length,
            commitsCreated: commitDates.length,
          });
        }

        // All projects done
        sendEvent({
          type: 'complete',
          message: 'All projects generated successfully!',
          totalProjects,
        });
      } catch (error) {
        console.error('[generate] Pipeline error:', error);
        sendEvent({
          type: 'error',
          message: `Pipeline error: ${error.message}`,
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}

/**
 * Distribute files across multiple commits.
 * The first commit gets the initial setup files (README, config),
 * remaining files are spread across subsequent commits.
 *
 * @param {Array<{path: string, content: string}>} files
 * @param {number} commitCount
 * @returns {Array<Array<{path: string, content: string}>>}
 */
function distributeFiles(files, commitCount) {
  if (commitCount <= 1) {
    return [files];
  }

  const result = Array.from({ length: commitCount }, () => []);

  // Put config/setup files in the first commit
  const setupPatterns = ['readme', 'package.json', '.gitignore', 'config', 'setup', 'cargo.toml', 'go.mod', 'pom.xml', 'requirements'];
  const setupFiles = [];
  const codeFiles = [];

  for (const file of files) {
    const lower = file.path.toLowerCase();
    if (setupPatterns.some((p) => lower.includes(p))) {
      setupFiles.push(file);
    } else {
      codeFiles.push(file);
    }
  }

  // First commit gets setup files
  result[0] = setupFiles.length > 0 ? setupFiles : [codeFiles.shift()].filter(Boolean);

  // Distribute remaining code files across remaining commits
  const remainingCommits = commitCount - 1;
  if (remainingCommits > 0 && codeFiles.length > 0) {
    const filesPerCommit = Math.ceil(codeFiles.length / remainingCommits);
    for (let i = 0; i < codeFiles.length; i++) {
      const commitIndex = Math.min(1 + Math.floor(i / filesPerCommit), commitCount - 1);
      result[commitIndex].push(codeFiles[i]);
    }
  }

  return result;
}

/**
 * Generate a realistic commit message based on the files being committed and the selected persona.
 * @param {Array<{path: string}>} files - Files in this commit
 * @param {boolean} isInitial - Whether this is the initial commit
 * @param {string} persona - The chosen AI commit persona
 * @returns {string} Commit message
 */
function generateCommitMessage(files, isInitial, persona = 'professional') {
  if (isInitial) {
    if (persona === 'emoji') return '🎉 Initial project setup';
    if (persona === 'terse') return 'init';
    if (persona === 'chaotic') return 'here we go again lol';
    return 'Initial project setup';
  }

  const PERSONA_TEMPLATES = {
    professional: {
      tests: 'test: add unit tests for components',
      styles: 'style: update layout and design tokens',
      docs: 'docs: update documentation',
      config: 'chore: update project configuration',
      core: 'feat: implement core functionality',
      prefixes: ['feat: add', 'fix: resolve issue in', 'chore: update', 'refactor: improve', 'docs: update'],
      fallback: (len) => `feat: implement ${len} new files`
    },
    emoji: {
      tests: '🧪 add unit tests for components',
      styles: '🎨 update layout and design tokens',
      docs: '📝 update documentation',
      config: '⚙️ update project configuration',
      core: '✨ implement core functionality',
      prefixes: ['✨ add', '🐛 fix', '🔨 refactor', '📦 build'],
      fallback: (len) => `✨ add ${len} new files`
    },
    terse: {
      tests: 'tests',
      styles: 'css',
      docs: 'readme',
      config: 'config',
      core: 'src',
      prefixes: ['add', 'fix', 'upd'],
      fallback: (len) => `upd ${len} f`
    },
    chaotic: {
      tests: 'hopefully this passes lol',
      styles: 'make it look less ugly',
      docs: 'i should write docs more often',
      config: 'pls work',
      core: 'stuff',
      prefixes: ['asdf', 'wip', 'did a thing', 'stuff'],
      fallback: (len) => `more stuff (${len})`
    }
  };

  const template = PERSONA_TEMPLATES[persona] || PERSONA_TEMPLATES.professional;
  const filePaths = files.map((f) => f.path);

  // Detect patterns for meaningful messages
  const hasTests = filePaths.some((p) => p.includes('test') || p.includes('spec'));
  const hasStyles = filePaths.some((p) => p.endsWith('.css') || p.endsWith('.scss'));
  const hasDocs = filePaths.some((p) => p.includes('README') || p.includes('docs'));
  const hasConfig = filePaths.some((p) => p.includes('config') || p.includes('.env'));

  if (hasTests) return template.tests;
  if (hasStyles) return template.styles;
  if (hasDocs) return template.docs;
  if (hasConfig) return template.config;

  // Describe based on directory
  const dirs = [...new Set(filePaths.map((p) => p.split('/')[0]))];
  if (dirs.length === 1 && dirs[0] === 'src') {
    return template.core;
  }

  const prefixes = template.prefixes;
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];

  if (files.length === 1) {
    const filename = filePaths[0].split('/').pop();
    return `${prefix} ${filename}`;
  }

  return template.fallback(files.length);
}

/**
 * Sleep helper for rate limiting.
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
