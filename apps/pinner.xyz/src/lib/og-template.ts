import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

// Brand colors from globals.css
const COLORS = {
  bg: "#0D1D1C",
  bgAlt: "#051413",
  text: "#F8F8F8",
  textMuted: "#BDC2C1",
  accent: "#ABEEDB",
  tealMuted: "#75AC9E",
};

// Resolve asset paths. During Astro build, import.meta.url points into
// dist/.prerender/chunks/ which is unreliable. Use absolute paths with fallbacks.
const APP_ROOT = resolve(process.cwd(), "apps/pinner.xyz");

function findAsset(relativePath: string): string {
  const fromCwd = resolve(process.cwd(), "apps/pinner.xyz", relativePath);
  if (existsSync(fromCwd)) return fromCwd;
  const fromAppRoot = resolve(process.cwd(), relativePath);
  if (existsSync(fromAppRoot)) return fromAppRoot;
  return resolve(APP_ROOT, relativePath);
}

const LOGO_PATH = findAsset("public/images/logo.png");
const LOGO_B64 = `data:image/png;base64,${readFileSync(LOGO_PATH).toString("base64")}`;

const FONT_DIR = findAsset("node_modules/@fontsource/poppins/files");

function loadFont(weight: number): Buffer {
  return readFileSync(resolve(FONT_DIR, `poppins-latin-${weight}-normal.woff`));
}

export interface OGConfig {
  headline: string;
  subtitle?: string;
  footer?: string;
  /** Override headline font size (default 72) */
  headlineSize?: number;
  /** Override subtitle font size (default 28) */
  subtitleSize?: number;
  /** Override footer font size (default 22) */
  footerSize?: number;
  /** Override gap between headline and subtitle (default 32px) */
  subtitleMargin?: number;
  /** Override logo size in px (default 64) */
  logoSize?: number;
  /** Override padding (default "64px 80px") */
  padding?: string;
}

export async function generateOGImage(config: OGConfig): Promise<Uint8Array> {
  const fonts = [
    { name: "Poppins", data: loadFont(600), weight: 600 as const, style: "normal" as const },
    { name: "Poppins", data: loadFont(400), weight: 400 as const, style: "normal" as const },
  ];

  const headlineSize = config.headlineSize ?? 72;
  const subtitleSize = config.subtitleSize ?? 28;
  const footerSize = config.footerSize ?? 22;
  const logoSize = config.logoSize ?? 64;
  const subtitleMargin = config.subtitleMargin ?? 32;
  const padding = config.padding ?? "64px 80px";

  // Layout: logo top-left, headline+subtitle centered, footer bottom
  // Research: "brand mark in a corner; do not center it" (llmbestpractices.com)
  // Research: 64px safe margin minimum (OGKit, env.dev)
  const tree = {
    type: "div",
    props: {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: COLORS.bg,
        fontFamily: "Poppins",
        padding,
      },
      children: [
        // Logo top-left
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              height: logoSize,
              marginBottom: "auto",
            },
            children: {
              type: "img",
              props: {
                src: LOGO_B64,
                width: logoSize,
                height: logoSize,
              },
            },
          },
        },
        // Headline + subtitle centered
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              flexDirection: "column" as const,
              alignItems: "center",
              justifyContent: "center",
            },
            children: [
              // Headline
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    fontWeight: 600,
                    fontSize: headlineSize,
                    color: COLORS.text,
                    lineHeight: 1.15,
                    textAlign: "center",
                  },
                  children: config.headline,
                },
              },
              // Subtitle
              ...(config.subtitle
                ? [
                    {
                      type: "div",
                      props: {
                        style: {
                          display: "flex",
                          marginTop: `${subtitleMargin}px`,
                          fontWeight: 400,
                          fontSize: subtitleSize,
                          color: COLORS.accent,
                          textAlign: "center",
                        },
                        children: config.subtitle,
                      },
                    },
                  ]
                : []),
            ],
          },
        },
        // Footer bottom-center
        ...(config.footer
          ? [
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    marginTop: "auto",
                    fontWeight: 400,
                    fontSize: footerSize,
                    color: COLORS.textMuted,
                  },
                  children: config.footer,
                },
              },
            ]
          : []),
      ],
    },
  };

  const svg = await satori(tree as any, {
    width: 1200,
    height: 630,
    fonts,
  });

  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: 1200 },
  });
  const pngData = resvg.render();
  return new Uint8Array(pngData.asPng());
}
