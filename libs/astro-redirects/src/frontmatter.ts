import type { RedirectRule, RedirectsPluginOptions } from "./types.js";
import matter from "gray-matter";

export interface Frontmatter {
  redirect_from?: string | string[];
  slug?: string;
  draft?: boolean;
}

/**
 * Extract `redirect_from` frontmatter values from a Markdown/MDX source string.
 *
 * Uses gray-matter for robust YAML frontmatter parsing.
 *
 * @param source - File content.
 * @returns Object with redirects array, optional slug override, and draft flag.
 */
export function extractRedirectFromFrontmatter(source: string): {
  redirects: string[];
  slug?: string;
  draft?: boolean;
} {
  const { data } = matter(source);

  const raw = data.redirect_from;
  const arr = Array.isArray(raw) ? raw : raw ? [raw] : [];

  return {
    redirects: arr.filter(
      (r): r is string => typeof r === "string" && isValidPath(r)
    ),
    slug: typeof data.slug === "string" ? data.slug : undefined,
    draft: data.draft === true ? true : undefined,
  };
}

function isValidPath(value: string): boolean {
  return value.length > 0 && !value.includes("://") && !value.includes(" ") && !value.includes("\n");
}

/**
 * Build redirect rules from frontmatter data.
 *
 * @param redirects - Array of redirect source paths.
 * @param slug - Destination page slug.
 * @returns Array of {@link RedirectRule}.
 */
function normalizeFrom(value: string): string {
  return value.startsWith("/") ? value : `/${value}`;
}

export function buildFrontmatterRules(
  redirects: string[],
  slug: string
): RedirectRule[] {
  return redirects.map((from) => ({
    from: normalizeFrom(from),
    to: slug.startsWith("/") ? slug : `/${slug}`,
    status: 301,
  }));
}
