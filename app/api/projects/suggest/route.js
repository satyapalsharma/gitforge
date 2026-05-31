import { getProjectsBySkills, getSkillCategories } from '@/lib/project-templates';
import { generateProjectSuggestions } from '@/lib/gemini';

/**
 * POST /api/projects/suggest
 *
 * Returns project suggestions filtered by skill categories.
 * Body params:
 *   - skills: array of skills
 *   - geminiApiKey: API key to generate dynamic suggestions (optional)
 * Response: { projects: [...], categories: [...] }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const skills = body.skills || [];
    const geminiApiKey = body.geminiApiKey;

    let projects = [];

    // If Gemini key is provided, generate dynamic suggestions
    if (geminiApiKey) {
      try {
        const dynamicProjects = await generateProjectSuggestions(geminiApiKey, skills.length > 0 ? skills : ['javascript', 'web']);
        
        // Ensure some static ones are also included to guarantee variety
        const staticProjects = getProjectsBySkills(skills);
        
        // Mix them: 6 dynamic + 2 static
        projects = [...dynamicProjects, ...staticProjects.slice(0, 2)];
      } catch (err) {
        console.error('[projects/suggest] Gemini fallback, using static', err);
        projects = getProjectsBySkills(skills);
      }
    } else {
      projects = getProjectsBySkills(skills);
    }

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

