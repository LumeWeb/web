import { execSync } from "node:child_process";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatMonthYear(date: string | Date): string {
  const y = typeof date === "string" ? date.split("-")[0] : date.getFullYear();
  const m = typeof date === "string" ? parseInt(date.split("-")[1], 10) - 1 : date.getMonth();
  return `${MONTHS[m]} ${y}`;
}

export function getGitLastUpdated(): string {
  try {
    const gitDate = execSync("git log -1 --format=%cs", {
      encoding: "utf-8",
      timeout: 5000,
    }).trim();
    return formatMonthYear(gitDate);
  } catch {
    return formatMonthYear(new Date());
  }
}
