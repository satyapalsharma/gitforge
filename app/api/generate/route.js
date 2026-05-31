import { auth } from '@/lib/auth';
import { createRepo, createBackdatedCommit, getUserEmails, createIssue, getRepoTree } from '@/lib/github';
import { generateProjectStructure, generateFileContent, generateFakeIssues } from '@/lib/gemini';
import { scheduleCommits } from '@/lib/commit-scheduler';

export const maxDuration = 300;

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

  const projects = body.projects;
  const startDate = body.startDate;
  const endDate = body.endDate;
  const geminiApiKey = body.geminiApiKey;
  const completedProjects = body.completedProjects || [];
  const persona = body.persona || 'professional';
  const scheduleProfile = body.scheduleProfile || 'balanced';
  const simulatePRs = body.simulatePRs || false;

  const projectsToProcess = projects.filter(p => {
    const repoName = p.name.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
    return !completedProjects.includes(repoName);
  });

  if (!projectsToProcess || !Array.isArray(projectsToProcess) || projectsToProcess.length === 0) {
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

        const totalProjects = projectsToProcess.length;

        for (let pi = 0; pi < totalProjects; pi++) {
          const project = projectsToProcess[pi];
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

          const otherProjects = projectsToProcess.filter((p, i) => i !== pi).map(p => p.name);
          let interconnectivityContext = '';
          if (otherProjects.length > 0) {
            interconnectivityContext = `This project is part of a larger interconnected system being generated, which includes: ${otherProjects.join(', ')}. Where appropriate (e.g., in README, API endpoints, package configs, or env variables), add configuration or mentions that reference these other services to simulate microservice/interconnected architecture.`;
          }

          let fileStructure;
          try {
            fileStructure = await generateProjectStructure(
              geminiApiKey,
              name,
              description,
              techStack || [],
              project.estimatedComplexity || 'medium',
              interconnectivityContext
            );
          } catch (error) {
            sendEvent({
              type: 'error',
              project: repoName,
              message: `Failed to generate structure: ${error.message}`,
            });
            continue; // Skip this project, continue with next
          }

          // 3b. Create the GitHub repo immediately
          sendEvent({
            type: 'progress',
            project: repoName,
            step: 'creating-repo',
            message: `Creating GitHub repository: ${repoName}...`,
            progress: Math.round(((pi + 0.15) / totalProjects) * 100),
            projectProgress: 10,
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

          await sleep(3000); // GitHub needs time to initialize the repo after creation

          // 3c. Fetch existing files from GitHub to skip already pushed ones (for resume)
          const existingFiles = await getRepoTree(accessToken, owner, repoName);
          const pendingFilesStructure = fileStructure.filter(f => !existingFiles.includes(f.path));
          
          if (pendingFilesStructure.length === 0) {
            sendEvent({
              type: 'progress',
              project: repoName,
              step: 'skipping',
              message: 'All files already exist in repository. Skipping...',
              progress: Math.round(((pi + 0.9) / totalProjects) * 100),
              projectProgress: 90,
            });
          } else {
            // 3d. Schedule commits for remaining files
            const totalCommits = Math.max(
              3,
              Math.ceil(pendingFilesStructure.length / 2) + 2
            );
            const commitDates = scheduleCommits(startDate, endDate, totalCommits, scheduleProfile);
            
            // Distribute pending files across commits
            const filesPerCommit = distributeFiles(pendingFilesStructure, commitDates.length);
            const projectContext = `Project: ${name}\nDescription: ${description}\nTech Stack: ${(techStack || []).join(', ')}\nFiles: ${fileStructure.map((f) => f.path).join(', ')}`;
            let generatedCount = 0;
            let totalFilesGenerated = existingFiles.length;

            // 3e. Generate and commit in chunks
            for (let ci = 0; ci < commitDates.length; ci++) {
              const commitFileStructure = filesPerCommit[ci];
              if (!commitFileStructure || commitFileStructure.length === 0) continue;

              const generatedCommitFiles = [];
              
              // Generate all files for this commit
              for (let fi = 0; fi < commitFileStructure.length; fi++) {
                const file = commitFileStructure[fi];
                generatedCount++;

                sendEvent({
                  type: 'progress',
                  project: repoName,
                  step: 'generating',
                  file: file.path,
                  message: `Generating ${file.path} (${generatedCount}/${pendingFilesStructure.length})...`,
                  progress: Math.round(((pi + 0.2 + (0.5 * generatedCount / pendingFilesStructure.length)) / totalProjects) * 100),
                  projectProgress: Math.round(15 + (55 * generatedCount / pendingFilesStructure.length)),
                });

                try {
                  const content = await generateFileContent(
                    geminiApiKey,
                    name,
                    file.path,
                    projectContext,
                    project.estimatedComplexity || 'medium',
                    interconnectivityContext
                  );

                  generatedCommitFiles.push({
                    path: file.path,
                    content,
                  });
                  totalFilesGenerated++;
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

              if (generatedCommitFiles.length === 0) continue;

              const commitMessage = generateCommitMessage(generatedCommitFiles, existingFiles.length === 0 && ci === 0, persona);
              const commitDate = commitDates[ci];

              // Retry logic for commits (first commit often fails due to repo init delay)
              let commitSuccess = false;
              for (let attempt = 0; attempt < 3; attempt++) {
                try {
                  await createBackdatedCommit(
                    accessToken,
                    owner,
                    repoName,
                    generatedCommitFiles,
                    commitMessage,
                    commitDate,
                    userEmail,
                    simulatePRs
                  );
                  commitSuccess = true;

                  sendEvent({
                    type: 'progress',
                    project: repoName,
                    step: 'committing',
                    message: `Pushed Commit ${ci + 1}/${commitDates.length}: ${commitMessage}`,
                    progress: Math.round(((pi + 0.7 + (0.2 * (ci + 1) / commitDates.length)) / totalProjects) * 100),
                    projectProgress: Math.round(70 + (20 * (ci + 1) / commitDates.length)),
                  });

                  await sleep(500);
                  break;
                } catch (error) {
                  console.error(`[generate] Commit ${ci + 1} attempt ${attempt + 1} failed:`, error);
                  if (attempt < 2) {
                    sendEvent({
                      type: 'warning',
                      project: repoName,
                      message: `Commit ${ci + 1} failed (attempt ${attempt + 1}/3), retrying in ${(attempt + 1) * 2}s...`,
                    });
                    await sleep((attempt + 1) * 2000);
                  } else {
                    sendEvent({
                      type: 'warning',
                      project: repoName,
                      message: `Commit ${ci + 1} failed after 3 attempts: ${error.message}`,
                    });
                  }
                }
              }
            }
          }

          // Track total files for completion event
          const totalFilesInProject = fileStructure.length;

          // 3f. Generate and create fake issues
          sendEvent({
            type: 'progress',
            project: repoName,
            step: 'creating-issues',
            message: 'Generating fake issues...',
            progress: Math.round(((pi + 0.95) / totalProjects) * 100),
            projectProgress: 95,
          });

          try {
            const fakeIssues = await generateFakeIssues(geminiApiKey, name, description, techStack);
            for (const issue of fakeIssues) {
              await createIssue(accessToken, owner, repoName, issue.title, issue.body, issue.labels);
              await sleep(500); // rate limiting
            }
          } catch (error) {
            console.error(`[generate] Failed to create fake issues:`, error);
          }

          sendEvent({
            type: 'project-complete',
            project: repoName,
            repoUrl: repo.html_url,
            message: `Completed: ${name}`,
            filesGenerated: totalFilesInProject,
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

  let baseMessage = template.fallback(files.length);

  if (hasTests) {
    baseMessage = template.tests;
  } else if (hasStyles) {
    baseMessage = template.styles;
  } else if (hasDocs) {
    baseMessage = template.docs;
  } else if (hasConfig) {
    baseMessage = template.config;
  } else {
    // Describe based on directory
    const dirs = [...new Set(filePaths.map((p) => p.split('/')[0]))];
    if (dirs.length === 1 && dirs[0] === 'src') {
      baseMessage = template.core;
    } else if (files.length === 1) {
      const prefixes = template.prefixes;
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      const filename = filePaths[0].split('/').pop();
      baseMessage = `${prefix} ${filename}`;
    }
  }

  // 25% chance to simulate a co-authored commit
  if (Math.random() < 0.25) {
    baseMessage += '\n\nCo-authored-by: GitForge AI <bot@gitforge.dev>';
  }

  return baseMessage;
}

/**
 * Sleep helper for rate limiting.
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
