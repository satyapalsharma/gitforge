import { getProjectsBySkills, getSkillCategories } from '@/lib/project-templates';

/**
 * GET /api/projects/suggest?skills=react,python
 *
 * Returns project suggestions filtered by skill categories.
 * Query params:
 *   - skills: comma-separated list of skills (optional, returns all if omitted)
 * Response: { projects: [...], categories: [...] }
 */
export async function GET(request) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const skillsParam = searchParams.get('skills');

    const skills = skillsParam
      ? skillsParam.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    const projects = getProjectsBySkills(skills);
    const categories = getSkillCategories();

    return Response.json({
      projects,
      categories,
      totalCount: projects.length,
    });
  } catch (error) {
    console.error('[projects/suggest] Error:', error);
    return Response.json(
      { error: 'Failed to fetch project suggestions' },
      { status: 500 }
    );
  }
}
