export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GITHUB_USERNAME = "c2keesey";
const URL_OVERRIDES: Record<string, string> = { "maia-analytics": "https://maia-analytics.com" };
const HIDE_COMMITS = new Set(["maia-analytics"]);

interface GitHubEvent { type: string; repo: { name: string }; created_at: string; public?: boolean; payload?: { head?: string } }
interface GitHubRepo { description: string | null; private?: boolean }

export async function GET() {
  try {
    const headers: Record<string, string> = { "User-Agent": "c2k.dev" };
    if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const events: GitHubEvent[] = [];

    for (let page = 1; page <= 10; page++) {
      const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/events?per_page=100&page=${page}`, { headers, signal: AbortSignal.timeout(5_000) });
      if (!response.ok) break;
      const batch = await response.json() as GitHubEvent[];
      if (!batch.length) break;
      events.push(...batch.filter((event) => event.public !== false));
      if (new Date(batch.at(-1)!.created_at).getTime() < cutoff) break;
    }

    let totalPushes = 0;
    const pushesByDay = [0, 0, 0, 0, 0, 0, 0];
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    for (const event of events) {
      const timestamp = new Date(event.created_at).getTime();
      if (event.type !== "PushEvent" || timestamp < cutoff) continue;
      totalPushes++;
      const date = new Date(event.created_at);
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
      const daysAgo = Math.floor((todayStart - dayStart) / 86_400_000);
      pushesByDay[6 - Math.min(daysAgo, 6)]++;
    }

    const seen = new Set<string>();
    const repoNames: Array<{ fullName: string; name: string; head?: string; pushedAt: string }> = [];
    for (const event of events) {
      if (event.type !== "PushEvent" || new Date(event.created_at).getTime() < cutoff) continue;
      const name = event.repo.name.split("/").pop()!;
      if (seen.has(name)) continue;
      seen.add(name);
      repoNames.push({ fullName: event.repo.name, name, head: event.payload?.head, pushedAt: event.created_at });
    }

    if (!repoNames.length) {
      const event = events.find((candidate) => candidate.type === "PushEvent");
      if (event) repoNames.push({ fullName: event.repo.name, name: event.repo.name.replace(`${GITHUB_USERNAME}/`, ""), head: event.payload?.head, pushedAt: event.created_at });
    }

    const repos = (await Promise.all(repoNames.map(async (repo) => {
      const [repoResponse, commitResponse] = await Promise.all([
        fetch(`https://api.github.com/repos/${repo.fullName}`, { headers, signal: AbortSignal.timeout(3_000) }).catch(() => null),
        repo.head ? fetch(`https://api.github.com/repos/${repo.fullName}/commits/${repo.head}`, { headers, signal: AbortSignal.timeout(3_000) }).catch(() => null) : null,
      ]);
      const repoData = repoResponse?.ok ? await repoResponse.json() as GitHubRepo : null;
      const commitData = commitResponse?.ok ? await commitResponse.json() as { commit: { message: string } } : null;
      const isPrivate = repoData?.private ?? false;
      if (isPrivate) return null;
      return {
        name: repo.name,
        url: URL_OVERRIDES[repo.name] ?? `https://github.com/${repo.fullName}`,
        description: repoData?.description ?? "",
        lastCommit: HIDE_COMMITS.has(repo.name) ? "" : commitData?.commit.message.split("\n")[0] ?? "",
        pushedAt: repo.pushedAt,
      };
    }))).filter((repo) => repo !== null);

    return Response.json({ repos, totalPushes, pushesByDay }, { headers: { "Cache-Control": "public, max-age=300" } });
  } catch {
    return Response.json({ repos: [], totalPushes: 0, pushesByDay: [0, 0, 0, 0, 0, 0, 0] }, { headers: { "Cache-Control": "public, max-age=300" } });
  }
}
