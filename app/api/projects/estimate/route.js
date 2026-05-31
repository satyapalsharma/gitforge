import { estimateProjectCost } from '@/lib/token-estimator';

/**
 * POST /api/projects/estimate
 *
 * Estimates token usage and cost for a set of projects.
 * Request body: { projects: [{ name, estimatedComplexity?, estimatedFiles?, description? }] }
 * Response: { totalTokens, totalCost, totalCommits, perProject: [...] }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { projects } = body;

    if (!projects || !Array.isArray(projects) || projects.length === 0) {
      return Response.json(
        { error: 'projects array is required and must not be empty' },
        { status: 400 }
      );
    }

    // Validate each project has at minimum a name
    for (const project of projects) {
      if (!project.name || typeof project.name !== 'string') {
        return Response.json(
          { error: 'Each project must have a "name" field' },
          { status: 400 }
        );
      }
    }

    const estimate = estimateProjectCost(projects);

    return Response.json(estimate);
  } catch (error) {
    console.error('[projects/estimate] Error:', error);
    return Response.json(
      { error: 'Failed to estimate project cost' },
      { status: 500 }
    );
  }
}
