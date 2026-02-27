export function formatRelativeTime(timestamp: bigint): string {
  // timestamp is nanoseconds from IC
  const nowMs = Date.now();
  const tsMs = Number(timestamp / 1_000_000n);
  const diffMs = nowMs - tsMs;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  const date = new Date(tsMs);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatRevenue(cents: bigint): string {
  const dollars = Number(cents) / 100;
  return `$${dollars.toFixed(2)}`;
}

export function formatCTR(clicks: bigint, impressions: bigint): string {
  if (impressions === 0n) return "0.00%";
  const ctr = (Number(clicks) / Number(impressions)) * 100;
  return `${ctr.toFixed(2)}%`;
}

export function getInitials(name: string): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function formatNumber(n: bigint): string {
  const num = Number(n);
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}
