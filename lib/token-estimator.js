/**
 * Token and cost estimation constants for Gemini 2.5 Flash.
 */
const PRICING = {
  inputPerMillionTokens: 0.15,  // $0.15 per 1M input tokens
  outputPerMillionTokens: 0.60, // $0.60 per 1M output tokens
};

/**
 * Estimated output tokens per complexity level.
 * These are conservative estimates based on typical code generation.
 */
const COMPLEXITY_TOKENS = {
  simple: {
    outputTokensPerFile: 800,
    inputTokensPerFile: 300,
    avgFiles: 6,
  },
  medium: {
    outputTokensPerFile: 1200,
    inputTokensPerFile: 400,
    avgFiles: 10,
  },
  complex: {
    outputTokensPerFile: 2000,
    inputTokensPerFile: 500,
    avgFiles: 13,
  },
};

/**
 * Overhead tokens for structure generation, commit messages, etc.
 */
const OVERHEAD_TOKENS = {
  structureGeneration: 1500, // input + output for generating file structure
  commitMessages: 200,      // per project commit message generation
};

/**
 * Estimate the total token usage and cost for a set of projects.
 *
 * @param {Array<{
 *   name: string,
 *   estimatedComplexity?: 'simple' | 'medium' | 'complex',
 *   estimatedFiles?: number,
 *   description?: string
 * }>} projects - Array of project configurations
 * @returns {{
 *   totalInputTokens: number,
 *   totalOutputTokens: number,
 *   totalTokens: number,
 *   totalCost: number,
 *   totalCommits: number,
 *   perProject: Array<{
 *     name: string,
 *     inputTokens: number,
 *     outputTokens: number,
 *     totalTokens: number,
 *     cost: number,
 *     estimatedFiles: number,
 *     estimatedCommits: number
 *   }>
 * }}
 */
export function estimateProjectCost(projects) {
  if (!projects || projects.length === 0) {
    return {
      totalInputTokens: 0,
      totalOutputTokens: 0,
      totalTokens: 0,
      totalCost: 0,
      totalCommits: 0,
      perProject: [],
    };
  }

  const perProject = projects.map((project) => {
    const complexity = project.estimatedComplexity || 'medium';
    const config = COMPLEXITY_TOKENS[complexity] || COMPLEXITY_TOKENS.medium;
    const fileCount = project.estimatedFiles || config.avgFiles;

    // Calculate tokens for file content generation
    const fileInputTokens = config.inputTokensPerFile * fileCount;
    const fileOutputTokens = config.outputTokensPerFile * fileCount;

    // Add overhead for structure generation and commit messages
    const inputTokens = fileInputTokens + OVERHEAD_TOKENS.structureGeneration;
    const outputTokens = fileOutputTokens + OVERHEAD_TOKENS.commitMessages;

    const totalTokens = inputTokens + outputTokens;

    // Estimate cost
    const inputCost = (inputTokens / 1_000_000) * PRICING.inputPerMillionTokens;
    const outputCost = (outputTokens / 1_000_000) * PRICING.outputPerMillionTokens;
    const cost = inputCost + outputCost;

    // Estimate commits (roughly 1 commit per 1-3 files, plus initial commits)
    const estimatedCommits = Math.ceil(fileCount / 2) + 2;

    return {
      name: project.name,
      inputTokens,
      outputTokens,
      totalTokens,
      cost: Math.round(cost * 10000) / 10000, // 4 decimal places
      estimatedFiles: fileCount,
      estimatedCommits,
    };
  });

  const totalInputTokens = perProject.reduce((sum, p) => sum + p.inputTokens, 0);
  const totalOutputTokens = perProject.reduce((sum, p) => sum + p.outputTokens, 0);
  const totalTokens = totalInputTokens + totalOutputTokens;
  const totalCost = perProject.reduce((sum, p) => sum + p.cost, 0);
  const totalCommits = perProject.reduce((sum, p) => sum + p.estimatedCommits, 0);

  return {
    totalInputTokens,
    totalOutputTokens,
    totalTokens,
    totalCost: Math.round(totalCost * 10000) / 10000,
    totalCommits,
    perProject,
  };
}
