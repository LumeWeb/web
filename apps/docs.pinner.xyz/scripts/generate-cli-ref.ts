/**
 * CLI Reference Generator
 *
 * Reads cli-ref.json (output of `pinner generate-docs json`) and produces
 * per-category MDX pages under /reference/cli/.
 *
 * All content is derived from the JSON source. The only editorial mapping
 * is CATEGORY_MAP (category name → URL slug), since slugs aren't in the
 * source. Categories not in CATEGORY_MAP get a kebab-case slug auto-generated.
 *
 * Usage:  pnpm generate:cli
 */

import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// ── Types ───────────────────────────────────────────────────────────

interface CLIFlag {
  name: string;
  shorthand?: string;
  usage?: string;
  description?: string;
  required?: boolean;
  hidden?: boolean;
  defaultValue?: string;
  envVars?: string[];
}

interface CLICommand {
  name: string;
  category?: string;
  description?: string;
  usage?: string;
  argsUsage?: string;
  flags?: CLIFlag[];
  commands?: CLICommand[];
}

interface CLIDoc {
  name: string;
  version: string;
  description: string;
  flags: CLIFlag[];
  commands: CLICommand[];
}

// ── Category → slug mapping ────────────────────────────────────────
// Categories come from the JSON, but we need editorial slugs for URLs.
// Any category NOT listed here gets a kebab-case slug auto-generated.

const CATEGORY_SLUGS: Record<string, string> = {
  "Setup": "setup",
  "Content": "content",
  "Pinning": "pinning",
  "Management": "websites",
  "Admin": "admin",
  "System": "system",
};

// ── Helpers ─────────────────────────────────────────────────────────

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

/** Convert a category name to a URL slug (explicit mapping or kebab-case fallback) */
function slugForCategory(category: string): string {
  if (!category || typeof category !== "string") return "misc";
  return CATEGORY_SLUGS[category] ?? category.toLowerCase().replace(/\s+/g, "-");
}

/** Replace <placeholder> with backtick-wrapped version so MDX doesn't parse as JSX */
function escapeMdxProse(text: string | undefined | null): string {
  if (!text) return "";
  return text.replace(/<(\w[\w-]*)>/g, "`<$1>`");
}

/** Get the best available description for a command or flag (urfave exports "usage", not "description") */
function getDescription(item: { description?: string; usage?: string }): string {
  return item.description || item.usage || "";
}

/** Collect all env vars referenced across all commands */
function collectEnvVars(doc: CLIDoc): { name: string; description: string }[] {
  const seen = new Set<string>();
  const envVars: { name: string; description: string }[] = [];

  function scanFlags(flags: CLIFlag[]) {
    for (const flag of flags) {
      if (flag.hidden) continue;
      for (const ev of flag.envVars ?? []) {
        if (seen.has(ev)) continue;
        seen.add(ev);
        envVars.push({ name: ev, description: getDescription(flag) });
      }
    }
  }

  // Check top-level flags and all command flags
  scanFlags(doc.flags);
  for (const cmd of doc.commands) {
    scanFlags(cmd.flags ?? []);
    for (const sub of cmd.commands ?? []) {
      scanFlags(sub.flags ?? []);
    }
  }

  return envVars;
}

/** Derive the ordered category list from the JSON commands */
function deriveCategories(commands: CLICommand[]): string[] {
  const seen = new Set<string>();
  const order: string[] = [];
  for (const cmd of commands) {
    const cat = cmd.category;
    if (!cat) {
      console.warn(`Warning: command "${cmd.name}" has no category, skipping in index`);
      continue;
    }
    if (!seen.has(cat)) {
      seen.add(cat);
      order.push(cat);
    }
  }
  return order;
}

/**
 * Parse a urfave/cli description string into structured MDX.
 *
 * urfave/cli format conventions:
 * - `  ` (double space) = paragraph separator
 * - ` - ` at start of a "paragraph" = unordered list item
 * - `  Examples:` = code example block header
 * - `  Some Header:` = section header within the description
 *
 * Strategy: split on double-space, then classify each chunk as
 * prose, list item, section header, or example block.
 */
function formatDescription(desc: string): string {
  const rawChunks = desc.split(/(?<=\S) {2,}(?=\S)/).map(c => c.trim()).filter(Boolean);
  if (!rawChunks.length) return "";

  const lines: string[] = [];
  let inList = false;

  for (let i = 0; i < rawChunks.length; i++) {
    const chunk = rawChunks[i];

    // "Examples:": collect all following chunks until next header/list
    if (/^Examples?:$/.test(chunk)) {
      if (inList) { lines.push(""); inList = false; }
      const examples: string[] = [];
      let j = i + 1;
      while (j < rawChunks.length && !rawChunks[j].startsWith("- ") && !rawChunks[j].includes("include:") && !/^Examples?:$/.test(rawChunks[j])) {
        examples.push(rawChunks[j].trim());
        j++;
      }
      i = j - 1;
      if (examples.length) {
        lines.push("```bash");
        for (const ex of examples) lines.push(ex);
        lines.push("```");
      }
      continue;
    }

    // List items
    if (chunk.startsWith("- ")) {
      if (!inList) inList = true;
      lines.push(`- ${chunk.slice(2).trim()}`);
      continue;
    }

    // "Header:" on its own line
    const headerMatch = chunk.match(/^(.+?:)\s*$/);
    if (headerMatch && !chunk.startsWith("-")) {
      if (inList) { lines.push(""); inList = false; }
      lines.push(`**${headerMatch[1]}**`);
      continue;
    }

    // "Header: content"
    const headerWithContent = chunk.match(/^(.+?:)\s+(.*)$/s);
    if (headerWithContent) {
      if (inList) { lines.push(""); inList = false; }
      lines.push(`**${headerWithContent[1]}** ${headerWithContent[2].trim()}`);
      inList = false;
      continue;
    }

    // Regular prose
    if (inList) { lines.push(""); inList = false; }
    lines.push(chunk);
  }

  if (inList) lines.push("");
  return joinLines(lines);
}

/** Join lines with single newlines for list items, double for paragraph breaks */
function joinLines(lines: string[]): string {
  const result: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const prev = result[result.length - 1] ?? "";
    const cur = lines[i];
    const curIsList = cur.startsWith("- ") || cur.startsWith("**");
    const prevIsList = prev.startsWith("- ") || prev.startsWith("**");

    if (curIsList && prevIsList && prev !== "") {
      result.push(cur);
    } else if (cur === "" || prev === "") {
      result.push(cur);
    } else {
      result.push("", cur);
    }
  }
  return result.join("\n");
}

// ── Renderers ───────────────────────────────────────────────────────

/** Render a single command as MDX */
function renderCommand(cmd: CLICommand, depth: number, parentPath: string, cliName: string): string {
  const parts: string[] = [];
  const heading = "#".repeat(Math.min(depth, 4));
  const fullPath = parentPath ? `${parentPath} ${cmd.name}` : cmd.name;

  parts.push(`${heading} \`${cmd.name}\``);
  parts.push("");

  // Usage line
  const argsPart = cmd.argsUsage ? ` ${cmd.argsUsage}` : "";
  const flagsPart = cmd.flags?.length ? " [flags]" : "";
  parts.push("```bash");
  parts.push(`${cliName} ${fullPath}${argsPart}${flagsPart}`);
  parts.push("```");

  // Description
  const cmdDesc = getDescription(cmd);
  if (cmdDesc) {
    const formatted = formatDescription(cmdDesc);
    if (formatted) {
      parts.push(escapeMdxProse(formatted));
      parts.push("");
    }
  }

  // Flags table
  if (cmd.flags?.length) {
    parts.push("| Flag | Alias | Description |");
    parts.push("|------|-------|-------------|");
    for (const flag of cmd.flags) {
      if (flag.hidden) continue;
      const alias = flag.shorthand ? `\`${flag.shorthand}\`` : "";
      const required = flag.required ? " **(required)**" : "";
      const defaultVal = flag.defaultValue ? ` (default: \`${flag.defaultValue}\`)` : "";
      const envVar = flag.envVars?.length ? ` [env: \`${flag.envVars[0]}\`]` : "";
      const desc = getDescription(flag);
      parts.push(`| \`${flag.name}\` | ${alias} | ${escapeMdxProse(desc)}${required}${defaultVal}${envVar} |`);
    }
    parts.push("");
  }

  // Subcommands
  if (cmd.commands?.length) {
    parts.push("**Subcommands:**");
    parts.push("");
    parts.push("| Subcommand | Description |");
    parts.push("|------------|-------------|");
    for (const sub of cmd.commands) {
      parts.push(`| \`${sub.name}\` | ${escapeMdxProse(getDescription(sub).split(/\s{2,}/)[0])} |`);
    }
    parts.push("");

    for (const sub of cmd.commands) {
      parts.push(renderCommand(sub, depth + 1, fullPath, cliName));
    }
  }

  return parts.join("\n");
}

/** Render the auto-generated notice banner */
function autoGeneratedNotice(): string[] {
  return [
    `> **This page is auto-generated** from the [pinner-cli](https://github.com/LumeWeb/pinner-cli) source code. Do not edit directly.`,
    "",
  ];
}

/** Render MDX frontmatter + auto-generated notice */
function frontmatter(title: string, description: string): string[] {
  return [
    "---",
    `title: "${title}"`,
    `description: "${description}"`,
    "---",
    "",
    ...autoGeneratedNotice(),
  ];
}

/** Render the index page */
function renderIndex(doc: CLIDoc, categories: string[], envVars: { name: string; description: string }[]): string {
  const parts: string[] = [];
  const cliName = doc.name;

  parts.push(...frontmatter("CLI Reference", `Complete reference for the ${cliName} CLI.`));

  // Use the top-level description from the JSON
  const introDesc = getDescription(doc).split(/\s{2,}/)[0];
  if (introDesc) {
    parts.push(escapeMdxProse(introDesc));
    parts.push("");
  }

  // Install → link to the getting started guide (canonical install page)
  parts.push("## Install");
  parts.push("");
  parts.push("See [Getting Started with the CLI](/ipfs/cli/getting-started) to install the Pinner CLI.");
  parts.push("");

  // Auth
  parts.push("## Authentication");
  parts.push("");
  parts.push("Most commands require authentication. Run `pinner setup` for the interactive wizard, or set `PINNER_AUTH_TOKEN` in your environment.");
  parts.push("");

  // Global flags (from JSON)
  const visibleFlags = doc.flags.filter(f => !f.hidden);
  if (visibleFlags.length) {
    parts.push("## Global Flags");
    parts.push("");
    parts.push("| Flag | Alias | Description |");
    parts.push("|------|-------|-------------|");
    for (const flag of visibleFlags) {
      const alias = flag.shorthand ? `\`${flag.shorthand}\`` : "";
      const desc = getDescription(flag);
      parts.push(`| \`${flag.name}\` | ${alias} | ${escapeMdxProse(desc)} |`);
    }
    parts.push("");
  }

  // Env vars (collected from flags across all commands)
  if (envVars.length) {
    parts.push("## Environment Variables");
    parts.push("");
    parts.push("| Variable | Description |");
    parts.push("|----------|-------------|");
    for (const ev of envVars) {
      parts.push(`| \`${ev.name}\` | ${ev.description} |`);
    }
    parts.push("");
  }

  // Command summary (categories derived from JSON)
  parts.push("## Command Summary");
  parts.push("");
  for (const category of categories) {
    const slug = slugForCategory(category);
    const commands = doc.commands.filter(c => c.category === category);
    if (!commands.length) continue;

    parts.push(`### [${category}](/reference/cli/${slug})`);
    parts.push("");
    parts.push("| Command | Description |");
    parts.push("|---------|-------------|");
    for (const cmd of commands) {
      parts.push(`| [\`${cmd.name}\`](/reference/cli/${slug}#${cmd.name}) | ${escapeMdxProse(getDescription(cmd).split(/\s{2,}/)[0])} |`);
    }
    parts.push("");
  }

  return parts.join("\n");
}

/** Render a category page */
function renderCategoryPage(doc: CLIDoc, category: string, cliName: string): string {
  const commands = doc.commands.filter(c => c.category === category);
  if (!commands.length) return "";

  const parts: string[] = [];
  parts.push(...frontmatter(`CLI: ${category}`, `${cliName} CLI commands for ${category?.toLowerCase() ?? "misc"}.`));

  for (const cmd of commands) {
    parts.push(renderCommand(cmd, 2, "", cliName));
  }

  return parts.join("\n");
}

// ── Main ────────────────────────────────────────────────────────────

const jsonPath = resolve(ROOT, "reference-sources", "cli-ref.json");
const outDir = resolve(ROOT, "docs", "pages", "reference", "cli");

console.log(`Reading ${jsonPath}...`);
const doc: CLIDoc = JSON.parse(readFileSync(jsonPath, "utf-8"));

const cliName = doc.name;
const categories = deriveCategories(doc.commands);
const envVars = collectEnvVars(doc);

// Clean output dir
rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

// Write index page
const indexContent = renderIndex(doc, categories, envVars);
const indexPath = resolve(outDir, "index.mdx");
writeFileSync(indexPath, indexContent);
console.log(`Wrote ${indexPath} (${indexContent.split("\n").length} lines)`);

// Write category pages
for (const category of categories) {
  const slug = slugForCategory(category);
  const content = renderCategoryPage(doc, category, cliName);
  if (!content) continue;

  const filePath = resolve(outDir, `${slug}.mdx`);
  writeFileSync(filePath, content);
  const cmdCount = doc.commands.filter(c => c.category === category).length;
  console.log(`Wrote ${filePath} (${content.split("\n").length} lines, ${cmdCount} commands)`);
}

console.log(`\nDone. Generated ${categories.filter(c => doc.commands.some(cmd => cmd.category === c)).length} category pages + index.`);
