import { defineConfig, devices } from "@playwright/test";

const deviceList = [
  // iPhones
  "iPhone SE (3rd gen)",
  "iPhone 15",
  "iPhone 15 Pro Max",
  "iPhone 15 landscape",
  
  // Android phones
  "Pixel 7",
  "Galaxy S24",
  
  // Tablets
  "iPad (gen 7)",
  "Galaxy Tab S9",
  "iPad Pro 11 landscape",
  
  // Desktop
  "Desktop Chrome",
  "Desktop Chrome HiDPI",
];

type SupportedBrowser = "chromium" | "firefox" | "webkit";

const browsers: SupportedBrowser[] = ["chromium", "firefox"];

export default defineConfig({
  // Configure projects for major browsers and devices
  projects: deviceList.flatMap((deviceName) => {
    const device = devices[deviceName];
    if (!device) {
      throw new Error(`Device "${deviceName}" not found in Playwright devices`);
    }

    return browsers.map((browser) => {
      const useConfig = {
        browserName: browser,
        ...device,
      };
      if (browser === "firefox") {
        delete useConfig.isMobile;
      }
      return {
        name: `${deviceName}-${browser}`,
        use: useConfig,
      };
    });
  }),

  // Look for test files in the "e2e" directory
  testDir: "./e2e",

  use: {
    baseURL: process.env.BASE_URL || "http://localhost:4173",
  },
});
