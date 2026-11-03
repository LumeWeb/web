/** Checks relative Markdown links and selects complete tests from shipped documentation. */
import { readdir, readFile, stat } from "node:fs/promises";
import { dirname, join, resolve, sep } from "node:path";

/** @param {string} directory */
export async function checkDocumentation(directory) {
  const root = resolve(directory);
  const pending = ["README.md"];
  try {
    for (const name of await readdir(join(root, "docs"))) {
      if (name.endsWith(".md")) pending.push(`docs/${name}`);
    }
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  for (const page of pending) {
    const markdown = await readFile(join(root, page), "utf8");
    for (const match of markdown.matchAll(
      /\[[^\]]*\]\(([^\s)]+)(?:\s+"[^"]*")?\)/g,
    )) {
      const href = match[1];
      if (/^[a-z]+:/i.test(href)) continue;
      const [relative, anchor] = href.split("#");
      const target = relative
        ? resolve(root, dirname(page), decodeURIComponent(relative))
        : join(root, page);
      if (!target.startsWith(root + sep))
        throw new Error(`Link outside package: ${page}: ${href}`);
      try {
        if (!(await stat(target)).isFile()) throw new Error("not a file");
      } catch {
        throw new Error(`Missing packed documentation: ${page}: ${href}`);
      }
      if (anchor && target.endsWith(".md")) {
        const contents = await readFile(target, "utf8");
        const headings = [...contents.matchAll(/^#{1,6} (.+)$/gm)].map(
          (match) =>
            match[1]
              .toLowerCase()
              .replace(/[^\p{L}\p{N}_ -]/gu, "")
              .replace(/ /g, "-"),
        );
        if (!headings.includes(decodeURIComponent(anchor)))
          throw new Error(`Missing packed heading: ${page}: ${href}`);
      }
    }
  }
}

/** @param {string} markdown @returns {Record<string, string>} */
export function recipes(markdown) {
  const selected = {};
  const expected = ["ordinary", "fixture", "publication"];
  for (const match of markdown.matchAll(
    /```ts recipe=([^\s]+)\n([\s\S]*?)\n```/g,
  )) {
    const [, name, source] = match;
    if (!expected.includes(name) || selected[name])
      throw new Error(`Unexpected recipe: ${name}`);
    selected[name] = source + "\n";
  }
  for (const name of expected) {
    if (!selected[name]) throw new Error(`Missing complete recipe: ${name}`);
  }
  return selected;
}
