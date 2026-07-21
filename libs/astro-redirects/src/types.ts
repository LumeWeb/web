/**
 * Represents a single redirect/rewrite rule.
 * Matches the IPFS _redirects spec and Netlify format.
 *
 * Status codes:
 * - 301, 302, 303, 307, 308: Supported by BOTH Astro and IPFS.
 *   These are passed to Astro's redirect config AND emitted to _redirects file.
 * - 200, 404, 410, 451: IPFS-only. Only emitted to _redirects file (when emitFile: true).
 *   NOT passed to Astro's redirect config.
 */
export interface RedirectRule {
  /** The path to match against. May include a trailing splat (*). */
  from: string;
  /** The destination path or URL. May include :splat placeholder. */
  to: string;
  /** HTTP status code. Defaults to 301. */
  status: number;
}

/**
 * Options for the Astro redirects integration.
 */
export interface RedirectsPluginOptions {
  /**
   * Enable parsing a `_redirects` file from the public directory.
   * Set to `false` to disable, or a custom path string relative to project root.
   * @default true
   */
  redirectsFile?: boolean | string;

  /**
   * Enable collecting `redirect_from` frontmatter from Markdown/MDX files.
   * @default true
   */
  frontmatter?: boolean;

  /**
   * Additional static redirects merged with parsed ones.
   * Values can be a simple destination string (implicit 301)
   * or a {@link RedirectRule} object.
   *
   * Extra redirects have the highest priority and win over _redirects file
   * and frontmatter rules when `from` paths conflict.
   */
  extra?: Record<string, string | RedirectRule>;

  /**
   * Also emit a `_redirects` text file to the build output directory.
   * Useful for static hosts that consume the file at deploy time (e.g., IPFS).
   * When true, ALL status codes (including 200/404/410/451) are preserved
   * in the emitted file, even though Astro only handles 3xx redirects natively.
   * @default false
   */
  emitFile?: boolean;

  /**
   * Directory to scan for Markdown/MDX frontmatter, relative to project root.
   * @default 'src/pages'
   */
  contentDir?: string;

  /**
   * Custom function to derive a slug from a file path.
   */
  getSlug?: (filePath: string) => string;
}
