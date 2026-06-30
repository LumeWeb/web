import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

const brandSchema = z.object({
  faviconUrl: z.string().optional(),
  loadingMessages: z.array(z.string()).optional(),
  logoUrl: z.string().optional(),
  siteUrl: z.string().url().optional(),
  social: z
    .object({
      twitter: z.string().optional(),
      discord: z.string().optional(),
      github: z.string().optional(),
    })
    .optional(),
  tagline: z.string().optional(),
  values: z.string().optional(),
});

export type BrandConfig = z.infer<typeof brandSchema>;

export const DEFAULT_BRAND: BrandConfig = {
  tagline: "Your data. Your Rules.",
  values: "Freedom\nPrivacy\nOwnership",
};

const brandSchemaWithDefault = z.preprocess(
  (val) => (typeof val === "string" ? JSON.parse(val) : val),
  brandSchema,
);

export const env = createEnv({
  client: {
    VITE_PORTAL_ALLOW_LOCALHOST: z.boolean().optional(),
    VITE_PORTAL_BRAND: brandSchemaWithDefault.optional().default(() => DEFAULT_BRAND),
    VITE_PORTAL_DOMAIN: z.string().includes(".").optional(),
    VITE_PORTAL_DOMAIN_IS_ROOT: z.boolean().optional(),
  },

  /**
   * The prefix that client-side variables must have. This is enforced both at
   * a type-level and at runtime.
   */
  clientPrefix: "VITE_",

  /**
   * By default, this library will feed the environment variables directly to
   * the Zod validator.
   *
   * This means that if you have an empty string for a value that is supposed
   * to be a number (e.g. `PORT=` in a ".env" file), Zod will incorrectly flag
   * it as a type mismatch violation. Additionally, if you have an empty string
   * for a value that is supposed to be a string with a default value (e.g.
   * `DOMAIN=` in an ".env" file), the default value will never be applied.
   *
   * In order to solve these issues, we recommend that all new projects
   * explicitly specify this option as true.
   */
  emptyStringAsUndefined: true,

  /**
   * What object holds the environment variables at runtime. This is usually
   * `process.env` or `import.meta.env`.
   */
  // @ts-ignore
  runtimeEnv: window,
});
