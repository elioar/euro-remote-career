"use client";

import { useEffect } from "react";

const tracked = new Set<string>();

export function ViewTracker({ jobId }: { jobId: string }) {
  useEffect(() => {
    if (tracked.has(jobId)) return;
    tracked.add(jobId);
    fetch(`/api/jobs/${jobId}/view`, { method: "POST" }).catch(() => {});
  }, [jobId]);

  return null;
}
