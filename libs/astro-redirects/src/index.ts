import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { AstroIntegration } from "astro";
import type { RedirectRule, RedirectsPluginOptions } from "./types.js";
import {
  parseRedirects,
  parseFrom,
  parseTo,
  parseStatus,
  isAstroSupportedStatus,
} from "./parse.js";
import {
  buildFrontmatterRules,
  extractRedirectFromFrontmatter,
} from "./frontmatter.js";

const DEFAULT_CONTENT_DIR = "src/pages";

export { parseRedirects };
export type { RedirectRule, RedirectsPluginOptions };

export default function astroRedirects(
  options: RedirectsPluginOptions = {}
): AstroIntegration {
  const {
    redirectsFile = true,
    frontmatter = true,
    extra = {},
    emitFile = false,
    contentDir = DEFAULT_CONTENT_DIR,
    getSlug = defaultGetSlug,
  } = options;

  // Accumulate rules across hooks for emitFile support
  let accumulatedRules: RedirectRule[] = [];

  return {
    name: "@lumeweb/astro-redirects",
    hooks: {
      "astro:config:setup": async ({
        config,
        command,
        updateConfig,
        logger,
      }) => {
        const rules: RedirectRule[] = [];
        const seen = new Set<string>();

        function addRules(newRules: RedirectRule[], source: string) {
          for (const rule of newRules) {
            if (seen.has(rule.from)) {
              const idx = rules.findIndex((r) => r.from === rule.from);
              if (idx !== -1) {
                logger.warn(
                  `Duplicate redirect from "${rule.from}" in ${source} — overriding`
                );
                rules[idx] = rule;
              }
              continue;
            }
            seen.add(rule.from);
            rules.push(rule);
          }
        }

        // 1. Parse _redirects file (lowest priority)
        if (redirectsFile) {
          const root = fileURLToPath(config.root);
          const publicDir = fileURLToPath(config.publicDir);

          const filePath =
            typeof redirectsFile === "string"
              ? path.resolve(root, redirectsFile)
              : path.join(publicDir, "_redirects");

          try {
            const stats = await fs.promises.stat(filePath);
            if (!stats.isFile()) {
              throw new Error(`_redirects path is not a file: ${filePath}`);
            }
            if (stats.size > 65536) {
              throw new Error(
                `_redirects file exceeds 64 KiB limit: ${stats.size} bytes`
              );
            }
            const content = await fs.promises.readFile(filePath, "utf-8");
            const parsed = parseRedirects(content);
            addRules(parsed, `_redirects file (${filePath})`);
            logger.info(`Parsed ${parsed.length} redirects from ${filePath}`);
          } catch (err: any) {
            if (err.code === "ENOENT") {
              if (typeof redirectsFile === "string") {
                throw new Error(`_redirects file not found: ${filePath}`);
              }
              // Optional default file not found — ok
            } else {
              throw err;
            }
          }
        }

        // 2. Frontmatter redirects (medium priority)
        if (frontmatter) {
          const root = fileURLToPath(config.root);
          const contentDirPath = path.resolve(root, contentDir);

          try {
            const dirStat = await fs.promises.stat(contentDirPath);
            if (!dirStat.isDirectory()) {
              throw new Error(`contentDir is not a directory: ${contentDirPath}`);
            }
            const mdFiles = await collectMarkdownFiles(contentDirPath);

            for (const file of mdFiles) {
              const source = await fs.promises.readFile(file, "utf-8");
              const {
                redirects: fmRedirects,
                slug: fmSlug,
                draft,
              } = extractRedirectFromFrontmatter(source);

              if (fmRedirects.length === 0) continue;

              // Skip drafts in production builds
              if (command === "build" && draft === true) continue;

              const slug =
                fmSlug || getSlug(path.relative(contentDirPath, file));
              const fmRules = buildFrontmatterRules(fmRedirects, slug);
              addRules(fmRules, `frontmatter in ${path.relative(root, file)}`);
            }

            logger.info(
              `Collected ${rules.length} redirects from frontmatter`
            );
          } catch (err: any) {
            if (err.code === "ENOENT") {
              // contentDir doesn't exist — ok
            } else {
              throw err;
            }
          }
        }

        // 3. Extra static redirects (highest priority) — validated
        const extraRules: RedirectRule[] = [];
        for (const [key, dest] of Object.entries(extra)) {
          const validatedFrom = parseFrom(key);
          if (typeof dest === "string") {
            extraRules.push({
              from: validatedFrom,
              to: parseTo(dest),
              status: 301,
            });
          } else {
            extraRules.push({
              from: validatedFrom,
              to: parseTo(dest.to),
              status: parseStatus(String(dest.status)),
            });
          }
        }
        addRules(extraRules, "extra config");

        if (rules.length === 0) {
          logger.warn("No redirects found");
          return;
        }

        // Store for build:done hook
        accumulatedRules = rules;

        // 4. Merge into Astro config (with status preservation)
        // Astro supports object form { status, destination } for redirects
        const astroRedirects: Record<
          string,
          string | { status: number; destination: string }
        > = { ...(config.redirects || {}) };

        for (const rule of rules) {
          if (isAstroSupportedStatus(rule.status)) {
            // Preserve the status code; Astro supports object form for non-301
            if (rule.status !== 301) {
              astroRedirects[rule.from] = {
                status: rule.status,
                destination: rule.to,
              };
            } else {
              astroRedirects[rule.from] = rule.to;
            }
          }
        }

        if (Object.keys(astroRedirects).length > 0) {
          updateConfig({ redirects: astroRedirects });
        }
      },

      "astro:build:done": async ({ dir, logger }) => {
        if (emitFile && accumulatedRules.length > 0) {
          const outDir = fileURLToPath(dir);

          const lines = accumulatedRules.map(
            (r) => `${r.from} ${r.to} ${r.status}`
          );
          await fs.promises.mkdir(outDir, { recursive: true });
          await fs.promises.writeFile(
            path.join(outDir, "_redirects"),
            lines.join("\n") + "\n"
          );

          logger.info(`Emitted _redirects file to ${outDir}`);
        }
      },
    },
  };
}

export async function collectMarkdownFiles(dir: string): Promise<string[]> {
  const results: string[] = [];
  const visited = new Set<string>();
  const rootReal = await fs.promises.realpath(dir);

  async function walk(current: string) {
    const real = await fs.promises.realpath(current);

    // Prevent symlink traversal outside contentDir
    const rel = path.relative(rootReal, real);
    if (rel.startsWith("..") || rel === "..") {
      return;
    }

    if (visited.has(real)) return;
    visited.add(real);

    const entries = await fs.promises.readdir(current, {
      withFileTypes: true,
    });

    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
      } else if (/\.(md|mdx)$/i.test(entry.name)) {
        const real = await fs.promises.realpath(full);
        const rel = path.relative(rootReal, real);
        if (rel.startsWith("..") || rel === "..") continue;
        results.push(full);
      }
    }
  }

  await walk(dir);
  return results;
}

function defaultGetSlug(filePath: string): string {
  // Strip index.md and extension
  const withoutExt = filePath.replace(/\.(md|mdx)$/i, "");
  return "/" + withoutExt.replace(/\\/g, "/").replace(/\/index$/, "");
}
