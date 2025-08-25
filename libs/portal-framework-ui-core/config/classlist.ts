const tailwindClassList = [
  ...Array.from({ length: 12 }, (_, i) => i + 1).flatMap((i) => [
    `col-end-[span_${i}]`,
    `sm:col-end-[span_${i}]`,
  ]),
  // Flex classes
  {
    pattern: /flex-.*/,
  },

  // Grid columns
  { pattern: /grid-cols-.*/ },

  // Responsive grid columns (sm variants)
  {
    pattern: /grid-cols-.*/,
    variants: ["sm", "tablet"],
  },

  // Column/row spans
  { pattern: /(col|row)-span-.*/ },

  // Column start/end classes
  { pattern: /col-start-.*/ },
  { pattern: /col-end-.*/, variants: ["sm", "tablet"] },

  // Column span classes
  { pattern: /col-span-.*/ },

  // Column start auto
  { pattern: /col-start-auto/ },

  // Grid auto rows classes
  { pattern: /auto-rows-.*/ },

  // Gap classes
  { pattern: /gap-.*/ },

  // Min/Max width/height classes
  { pattern: /(min-w|min-h|max-w|max-h)-.*/ },

  // Hidden class
  "hidden",
];

// Generate actual class names for blocklist usage
const generateClassNamesFromPatterns = () => {
  const classes: string[] = [];

  // Generate common classes that match the patterns
  Array.from({ length: 12 }, (_, i) => i + 1).forEach((i) => {
    classes.push(`grid-cols-${i}`);
    classes.push(`sm:grid-cols-${i}`);
    classes.push(`tablet:grid-cols-${i}`);
    classes.push(`col-span-${i}`);
    classes.push(`col-end-[span_${i}]`);
    classes.push(`sm:col-end-[span_${i}]`);
    classes.push(`row-span-${i}`);
    classes.push(`col-start-${i}`);
    classes.push(`col-end-${i}`);
    classes.push(`sm:col-end-${i}`);
    classes.push(`min-w-${i}`);
    classes.push(`min-h-${i}`);
    classes.push(`max-w-${i}`);
    classes.push(`max-h-${i}`);
  });

  // Add auto start classes
  classes.push("col-start-auto");

  // Generate gap classes
  const gaps = [0, 1, 2, 4, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 64, 80];
  gaps.forEach((gap) => {
    if (gap === 0) classes.push("gap-0");
    else if (gap === 1) classes.push("gap-px");
    else classes.push(`gap-${gap}`);
  });

  // Add other common classes
  classes.push("auto-rows-auto");
  classes.push("hidden");

  return classes;
};

export const tailwindSafelist = tailwindClassList;
export const tailwindBlocklist = generateClassNamesFromPatterns();

export default tailwindClassList;
