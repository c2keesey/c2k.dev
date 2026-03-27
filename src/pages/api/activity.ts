export const prerender = false;

const GITHUB_USERNAME = 'c2keesey';

// Override URLs for private repos or repos with dedicated websites
const URL_OVERRIDES: Record<string, string> = {
  'maia-analytics': 'https://maia-analytics.com',
};

// Repos that should never show commit messages publicly
const HIDE_COMMITS: Set<string> = new Set(['maia-analytics']);

interface GHEvent {
  type: string;
  repo: { name: string };
  created_at: string;
  payload?: { head?: string };
}

interface GHRepo {
  description: string | null;
}

export async function GET() {
  try {
    const headers: Record<string, string> = { 'User-Agent': 'c2k.dev' };
    const token = process.env.GITHUB_TOKEN;
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;

    // Paginate events API (up to 10 pages, 100 per page) to cover the full 7-day window
    const events: GHEvent[] = [];
    for (let page = 1; page <= 10; page++) {
      const res = await fetch(
        `https://api.github.com/users/${GITHUB_USERNAME}/events?per_page=100&page=${page}`,
        { signal: AbortSignal.timeout(5000), headers }
      );
      if (!res.ok) break;
      const batch = await res.json() as GHEvent[];
      if (batch.length === 0) break;
      events.push(...batch);
      // Stop if we've reached events older than our cutoff
      const oldest = new Date(batch[batch.length - 1].created_at).getTime();
      if (oldest < cutoff) break;
    }

    // Compute activity metrics: count pushes per day (GitHub Events API doesn't expose commit counts)
    let totalPushes = 0;
    const pushesByDay = [0, 0, 0, 0, 0, 0, 0]; // [6 days ago ... today]
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    for (const e of events) {
      if (e.type !== 'PushEvent') continue;
      const ts = new Date(e.created_at).getTime();
      if (ts < cutoff) continue;
      totalPushes++;
      const evtDate = new Date(e.created_at);
      const evtDayStart = new Date(evtDate.getFullYear(), evtDate.getMonth(), evtDate.getDate()).getTime();
      const daysAgo = Math.floor((todayStart - evtDayStart) / (24 * 60 * 60 * 1000));
      const idx = 6 - Math.min(daysAgo, 6);
      pushesByDay[idx]++;
    }

    // Collect unique repos from push events in last week
    const seen = new Set<string>();
    const repoNames: Array<{ fullName: string; name: string; head?: string; pushedAt: string }> = [];

    for (const e of events) {
      if (e.type !== 'PushEvent') continue;
      if (new Date(e.created_at).getTime() < cutoff) continue;

      const name = e.repo.name.includes('/') ? e.repo.name.split('/').pop()! : e.repo.name;
      if (seen.has(name)) continue;
      seen.add(name);
      repoNames.push({ fullName: e.repo.name, name, head: e.payload?.head, pushedAt: e.created_at });
    }

    // If nothing in 24h, fall back to most recent push
    if (repoNames.length === 0) {
      const push = events.find(e => e.type === 'PushEvent');
      if (push) {
        const name = push.repo.name.replace(`${GITHUB_USERNAME}/`, '');
        repoNames.push({ fullName: push.repo.name, name, head: push.payload?.head, pushedAt: push.created_at });
      }
    }

    // Fetch repo descriptions and last commit messages in parallel
    const repos = await Promise.all(repoNames.map(async (r) => {
      const [repoRes, commitRes] = await Promise.all([
        fetch(`https://api.github.com/repos/${r.fullName}`, { headers, signal: AbortSignal.timeout(3000) }).catch(() => null),
        r.head ? fetch(`https://api.github.com/repos/${r.fullName}/commits/${r.head}`, { headers, signal: AbortSignal.timeout(3000) }).catch(() => null) : null,
      ]);

      const repoData = repoRes?.ok ? await repoRes.json() as GHRepo : null;
      const commitData = commitRes?.ok ? await commitRes.json() as { commit: { message: string } } : null;
      const lastCommit = commitData?.commit?.message?.split('\n')[0] ?? '';

      const isPrivate = (repoData as { private?: boolean } | null)?.private ?? false;
      const hideCommit = isPrivate || HIDE_COMMITS.has(r.name);
      return {
        name: r.name,
        url: URL_OVERRIDES[r.name] ?? (isPrivate ? '#' : `https://github.com/${r.fullName}`),
        description: repoData?.description ?? '',
        lastCommit: hideCommit ? '' : lastCommit,
        pushedAt: r.pushedAt,
      };
    }));

    return json({ repos, totalPushes, pushesByDay });
  } catch {
    return json({ repos: [], totalPushes: 0, pushesByDay: [0,0,0,0,0,0,0] });
  }
}

function json(data: unknown) {
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=300' },
  });
}
