export async function readGitHubAssignedIssues(): Promise<
  { available: true; content: unknown } | { available: false; reason: string }
> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return { available: false, reason: 'GITHUB_TOKEN is not configured' };

  const response = await fetch('https://api.github.com/issues?filter=assigned&state=open', {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'moss-marten',
    },
  });

  if (!response.ok) return { available: false, reason: `GitHub API returned ${response.status}` };
  return { available: true, content: await response.json() };
}
