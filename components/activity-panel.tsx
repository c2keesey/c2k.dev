"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";

interface ActivityPayload {
  repos: Array<{ name: string; url: string; description: string; lastCommit: string; pushedAt: string }>;
  totalPushes: number;
  pushesByDay: number[];
}

const fallback: ActivityPayload = { repos: [], totalPushes: 0, pushesByDay: [0, 0, 0, 0, 0, 0, 0] };

export function ActivityPanel() {
  const [activity, setActivity] = useState<ActivityPayload>(fallback);

  useEffect(() => {
    let active = true;
    fetch("/api/activity")
      .then((response) => response.ok ? response.json() : fallback)
      .then((data: ActivityPayload) => { if (active) setActivity(data); })
      .catch(() => undefined);
    return () => { active = false; };
  }, []);

  const peak = Math.max(...activity.pushesByDay, 1);
  return (
    <Card className="activity-card">
      <div className="activity-header">
        <div><span className="eyebrow">Live signal</span><h2>Last seven days</h2></div>
        <strong>{activity.totalPushes}<small> pushes</small></strong>
      </div>
      <div className="activity-bars" aria-label={`${activity.totalPushes} GitHub pushes in the last seven days`}>
        {activity.pushesByDay.map((value, index) => (
          <span key={index} style={{ "--bar": `${Math.max(8, (value / peak) * 100)}%` } as React.CSSProperties} title={`${value} pushes`} />
        ))}
      </div>
      <div className="activity-repos">
        {activity.repos.slice(0, 3).map((repo) => (
          <a href={repo.url} key={repo.name} target={repo.url === "#" ? undefined : "_blank"} rel="noreferrer">
            <span>{repo.name}</span><small>{repo.lastCommit || repo.description || "recent activity"}</small>
          </a>
        ))}
        {activity.repos.length === 0 && <p>GitHub activity will appear when the signal is available.</p>}
      </div>
    </Card>
  );
}
