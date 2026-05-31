const GITHUB_API = 'https://api.github.com';

/**
 * Make an authenticated request to the GitHub API.
 * @param {string} accessToken - GitHub OAuth access token
 * @param {string} endpoint - API endpoint path (e.g. /user/repos)
 * @param {object} [options] - Additional fetch options
 * @returns {Promise<object>} Parsed JSON response
 */
async function githubFetch(accessToken, endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${GITHUB_API}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    const errorMessage = data.message || `GitHub API error: ${res.status}`;
    console.error(`[GitHub API] ${options.method || 'GET'} ${endpoint} → ${res.status}:`, errorMessage);
    throw new Error(errorMessage);
  }

  return data;
}

/**
 * Create a new public GitHub repository with an initial commit.
 * @param {string} accessToken - GitHub OAuth access token
 * @param {string} name - Repository name
 * @param {string} description - Repository description
 * @returns {Promise<object>} Created repository data
 */
export async function createRepo(accessToken, name, description) {
  console.log(`[GitHub] Creating repo: ${name}`);

  try {
    const repo = await githubFetch(accessToken, '/user/repos', {
      method: 'POST',
      body: JSON.stringify({
        name,
        description,
        auto_init: true,
        private: false,
      }),
    });
    console.log(`[GitHub] Repo created: ${repo.full_name}`);
    return repo;
  } catch (error) {
    if (error.message.toLowerCase().includes('name already exists') || error.message.includes('Validation Failed')) {
      console.log(`[GitHub] Repo ${name} already exists. Fetching existing repo...`);
      const user = await githubFetch(accessToken, '/user');
      const repo = await githubFetch(accessToken, `/repos/${user.login}/${name}`);
      return repo;
    }
    throw error;
  }
}

/**
 * Get all file paths currently in the repository's default branch.
 * @param {string} accessToken - GitHub OAuth access token
 * @param {string} owner - Repository owner username
 * @param {string} repo - Repository name
 * @returns {Promise<string[]>} Array of file paths
 */
export async function getRepoTree(accessToken, owner, repo) {
  try {
    const repoInfo = await githubFetch(accessToken, `/repos/${owner}/${repo}`);
    const branch = repoInfo.default_branch || 'main';

    const ref = await githubFetch(accessToken, `/repos/${owner}/${repo}/git/refs/heads/${branch}`);
    const commitSha = ref.object.sha;
    
    const commit = await githubFetch(accessToken, `/repos/${owner}/${repo}/git/commits/${commitSha}`);
    const treeSha = commit.tree.sha;
    
    const tree = await githubFetch(accessToken, `/repos/${owner}/${repo}/git/trees/${treeSha}?recursive=1`);
    
    return tree.tree.filter(item => item.type === 'blob').map(item => item.path);
  } catch (error) {
    console.error(`[GitHub] getRepoTree failed for ${owner}/${repo}:`, error.message);
    return [];
  }
}

/**
 * Creates an issue on the repository
 * @param {string} accessToken - GitHub OAuth access token
 * @param {string} owner - Repository owner username
 * @param {string} repo - Repository name
 * @param {string} title - Issue title
 * @param {string} body - Issue body markdown
 * @param {string[]} [labels] - Optional labels
 * @returns {Promise<object>} The created issue
 */
export async function createIssue(accessToken, owner, repo, title, body, labels = []) {
  try {
    return await githubFetch(accessToken, `/repos/${owner}/${repo}/issues`, {
      method: 'POST',
      body: JSON.stringify({
        title,
        body,
        labels
      })
    });
  } catch (error) {
    console.error(`[github] Error creating issue: ${error.message}`);
    return null;
  }
}

/**
 * Create a backdated commit using the Git Data API.
 *
 * Steps:
 *   1. Get latest commit SHA from refs/heads/main
 *   2. Get tree SHA from that commit
 *   3. Create blobs for each file
 *   4. Create new tree with the blobs
 *   5. Create commit with custom author.date and committer.date
 *   6. Update ref to point to new commit
 *
 * @param {string} accessToken - GitHub OAuth access token
 * @param {string} owner - Repository owner (username)
 * @param {string} repo - Repository name
 * @param {Array<{path: string, content: string}>} files - Files to commit
 * @param {string} message - Commit message
 * @param {string} date - ISO 8601 date string for the commit
 * @param {string} email - Verified email address for the commit author
 * @returns {Promise<object>} Created commit data
 */
export async function createBackdatedCommit(accessToken, owner, repo, files, message, date, email) {
  const repoBase = `/repos/${owner}/${repo}`;

  // 1. Get the latest commit SHA from refs/heads/main
  const ref = await githubFetch(accessToken, `${repoBase}/git/refs/heads/main`);
  const latestCommitSha = ref.object.sha;

  // 2. Get the tree SHA from that commit
  const latestCommit = await githubFetch(accessToken, `${repoBase}/git/commits/${latestCommitSha}`);
  const baseTreeSha = latestCommit.tree.sha;

  // 3. Create blobs for each file
  const treeItems = [];
  for (const file of files) {
    const blob = await githubFetch(accessToken, `${repoBase}/git/blobs`, {
      method: 'POST',
      body: JSON.stringify({
        content: file.content,
        encoding: 'utf-8',
      }),
    });

    treeItems.push({
      path: file.path,
      mode: '100644', // regular file
      type: 'blob',
      sha: blob.sha,
    });
  }

  // 4. Create a new tree with the blobs
  const newTree = await githubFetch(accessToken, `${repoBase}/git/trees`, {
    method: 'POST',
    body: JSON.stringify({
      base_tree: baseTreeSha,
      tree: treeItems,
    }),
  });

  // 5. Create the commit with custom dates
  // IMPORTANT: email MUST match a verified email on the GitHub account
  // for the commit to count toward the contribution graph
  const authorInfo = {
    name: owner,
    email: email,
    date,
  };

  const newCommit = await githubFetch(accessToken, `${repoBase}/git/commits`, {
    method: 'POST',
    body: JSON.stringify({
      message,
      tree: newTree.sha,
      parents: [latestCommitSha],
      author: authorInfo,
      committer: authorInfo,
    }),
  });

  // 6. Update the ref to point to the new commit
  await githubFetch(accessToken, `${repoBase}/git/refs/heads/main`, {
    method: 'PATCH',
    body: JSON.stringify({
      sha: newCommit.sha,
    }),
  });

  console.log(`[GitHub] Backdated commit created: ${newCommit.sha.slice(0, 7)} on ${date}`);
  return newCommit;
}

/**
 * Get the authenticated user's GitHub profile.
 * @param {string} accessToken - GitHub OAuth access token
 * @returns {Promise<object>} User profile data
 */
export async function getUserProfile(accessToken) {
  return githubFetch(accessToken, '/user');
}

/**
 * Get the authenticated user's email addresses.
 * Returns the primary verified email if available.
 * @param {string} accessToken - GitHub OAuth access token
 * @returns {Promise<string|null>} Primary verified email or null
 */
export async function getUserEmails(accessToken) {
  const emails = await githubFetch(accessToken, '/user/emails');

  // Find the primary verified email
  const primary = emails.find((e) => e.primary && e.verified);
  if (primary) return primary.email;

  // Fall back to any verified email
  const verified = emails.find((e) => e.verified);
  if (verified) return verified.email;

  // Fall back to the first email
  return emails.length > 0 ? emails[0].email : null;
}
