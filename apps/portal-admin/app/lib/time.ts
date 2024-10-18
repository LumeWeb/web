// timeUtils.ts

export function parseDuration(durationString: string): number | null {
  const regex = /^(\d+(\.\d+)?)(ns|us|µs|ms|s|m|h)$/;
  const parts = durationString.match(/(\d+(\.\d+)?[nµumsh])/g);
  if (!parts) return null;

  let totalMs = 0;
  for (const part of parts) {
    const match = part.match(regex);
    if (!match) return null;

    const value = parseFloat(match[1]);
    const unit = match[3];

    const unitToMs: { [key: string]: number } = {
      ns: value / 1e6,
      us: value / 1e3,
      µs: value / 1e3,
      ms: value,
      s: value * 1e3,
      m: value * 60 * 1e3,
      h: value * 60 * 60 * 1e3,
    };

    totalMs += unitToMs[unit] || 0;
  }

  return totalMs;
}

export function formatDuration(ms: number): string {
  const units = [
    { value: 60 * 60 * 1000, label: "h" },
    { value: 60 * 1000, label: "m" },
    { value: 1000, label: "s" },
    { value: 1, label: "ms" },
    { value: 0.001, label: "µs" },
    { value: 0.000001, label: "ns" },
  ];

  let result = "";
  let remainingMs = ms;

  for (const unit of units) {
    if (remainingMs >= unit.value || result !== "") {
      const count = Math.floor(remainingMs / unit.value);
      if (count > 0) {
        result += `${count}${unit.label} `;
        remainingMs %= unit.value;
      }
    }
  }

  return result.trim() || "0ns";
}

export function formatDurationString(durationString: string): string {
  const ms = parseDuration(durationString);
  if (ms === null) return durationString; // Return original if parsing fails
  return formatDuration(ms);
}
