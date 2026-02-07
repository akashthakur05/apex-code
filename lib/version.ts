function formatDate(timestamp?: string) {
  if (!timestamp) return "unknown";

  const date = new Date(Number(timestamp));

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");

  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");

  return `${yyyy}.${mm}.${dd}-${hh}:${min}`;
}

const deploymentId =
  process.env.NEXT_PUBLIC_DEPLOYMENT_ID || "local";

const commit =
  process.env.NEXT_PUBLIC_COMMIT_SHA?.slice(0, 7) || "dev";

const timestamp =
  process.env.NEXT_PUBLIC_DEPLOYMENT_TIME;

const formattedDate = formatDate(timestamp);

export const VERSION =
  `v${formattedDate}-${commit}-${deploymentId}`;

export const BUILD_DATE =
  timestamp
    ? new Date(Number(timestamp)).toLocaleString()
    : "local";
