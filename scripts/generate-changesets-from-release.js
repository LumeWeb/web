#!/usr/bin/env node

import writeChangeset from "@changesets/write";
import fs from "fs";
import meow from "meow";
import child_process from "node:child_process";
import { promisify } from "node:util";
import PQueue from "p-queue";
import path from "path";
import simpleGit from "simple-git";
import { parse, stringify } from "smol-toml";

const exec = promisify(child_process.exec);

const cli = meow(
  `
  Usage
    $ generate-changesets-from-release

  Options
    --changesets-dir, -c     Path to .changeset directory
    --packages-dir, -p       Path to packages root
    --knope-config, -k       Path to knope.toml
    --dry-run, -d            Show what would be generated without creating files
`,
  {
    importMeta: import.meta,
    flags: {
      changesetsDir: { type: "string", shortFlag: "c" },
      packagesDir: { type: "string", shortFlag: "p" },
      knopeConfig: { type: "string", shortFlag: "k" },
      dryRun: { type: "boolean", shortFlag: "d" },
    },
  },
);

class ChangesetGenerator {
  constructor(options = {}) {
    this.knopeConfigFile =
      options.knopeConfigFile || path.join(process.cwd(), "knope.toml");
    this.changesetsDir =
      options.changesetsDir || path.join(process.cwd(), ".changeset");
    this.packagesDir = options.packagesDir || process.cwd();
    this.packageNameToPath = null;
    this.originalKnopeConfig = null;
    this.dryRun = options.dryRun || false;
    this.git = simpleGit(this.packagesDir);

    this.validationQueue = new PQueue({ concurrency: 10 });
    this.changesetQueue = new PQueue({ concurrency: 5 });
  }

  async initialize() {
    this.packageNameToPath = await this.buildPackageNameToPathMap();
  }

  async buildPackageNameToPathMap() {
    const configContent = fs.readFileSync(this.knopeConfigFile, "utf-8");
    const config = parse(configContent);
    const map = {};

    for (const pkgKey of Object.keys(config.packages || {}) || []) {
      if (
        config.packages[pkgKey].versioned_files &&
        config.packages[pkgKey].versioned_files.length > 0
      ) {
        const versionedFile = config.packages[pkgKey].versioned_files[0];

        map[pkgKey] = path.dirname(versionedFile);
      }
    }
    return map;
  }

  async modifyKnopeConfig(modifier) {
    const configContent = fs.readFileSync(this.knopeConfigFile, "utf-8");
    this.originalKnopeConfig = configContent;
    const config = parse(configContent);
    modifier(config);
    const newContent = stringify(config, { 
      indent: 2,
      arrayIndent: 2,
      align: false,
      keyQuote: false,
      inlineTuples: false,
      sortKeys: false
    });
    fs.copyFileSync(this.knopeConfigFile, `${this.knopeConfigFile}.bak`);
    fs.writeFileSync(this.knopeConfigFile, newContent, "utf-8");
  }

  async restoreKnopeConfig() {
    if (this.originalKnopeConfig) {
      fs.writeFileSync(this.knopeConfigFile, this.originalKnopeConfig, "utf-8");
      const bakFile = `${this.knopeConfigFile}.bak`;
      if (fs.existsSync(bakFile)) {
        fs.unlinkSync(bakFile);
      }
      this.originalKnopeConfig = null;
    }
  }

  async runKnopeDryRun() {
    console.log("Running knope release --dry-run...");
    try {
      const { stdout } = await exec("knope release --dry-run", {
        env: process.env,
      });
      return stdout;
    } catch (error) {
      throw new Error(
        `Failed to run knope release --dry-run: ${error.message}`,
      );
    }
  }

  /**
   * Parse knope dry-run output, extracting changelog messages grouped by
   * the CHANGELOG.md path header knope emits. Returns a map of
   * package path → [{message, type}] preserving knope's own per-package
   * grouping instead of flattening into a global set.
   */
  extractPerPackageChangelogMessages(content) {
    const result = {};
    const lines = content.split("\n");
    let currentPkgPath = null;
    let currentType = null;

    for (const line of lines) {
      const changelogMatch = line.match(
        /Would add the following to (.+)\/CHANGELOG\.md:/,
      );
      if (changelogMatch) {
        currentPkgPath = changelogMatch[1];
        currentType = null;
        continue;
      }

      // Terminus line ends the current changelog section
      if (
        currentPkgPath &&
        (line.startsWith("Would ") || line.startsWith("--"))
      ) {
        currentPkgPath = null;
        currentType = null;
        continue;
      }

      if (!currentPkgPath) continue;

      // Section headers like "### Features", "### Fixes", "### Breaking Changes"
      const sectionMatch = line.match(/^###\s+(.+)$/);
      if (sectionMatch) {
        const section = sectionMatch[1].toLowerCase();
        if (section.includes("breaking")) currentType = "breaking changes";
        else if (section.includes("fix")) currentType = "fixes";
        else if (section.includes("feature")) currentType = "features";
        continue;
      }

      // Sub-headers like "#### Features" — skip but don't reset type
      if (line.match(/^####\s+/)) continue;

      // Changelog entry lines
      if (line.startsWith("- ") && line.trim() !== "- ") {
        const message = line.substring(2).trim();
        if (message) {
          if (!result[currentPkgPath]) result[currentPkgPath] = [];
          result[currentPkgPath].push({
            message,
            type: currentType || "features",
          });
        }
      }
    }
    return result;
  }

  /**
   * Validate that a changelog message actually belongs to a package by
   * checking if any commit matching the message touched files in the
   * package's directory since its last release tag.
   * This corrects for knope's over-broad changelog assignment (upstream bug
   * where ALL conventional commits appear in EVERY package's changelog).
   */
  async validateMessageBelongsToPackage(message, pkgPath, tag) {
    const args = ["log", "--oneline", `--grep=${message}`];
    if (tag) {
      args.push(`${tag}..HEAD`);
    }
    args.push("--", pkgPath);

    try {
      const output = await this.git.raw(args);
      const commits = output.trim().split("\n").filter(Boolean);
      return commits.length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Build the final per-package changelog data by:
   * 1. Using knope's per-package grouping from CHANGELOG.md headers
   * 2. Validating each message actually belongs to the package
   *    (scoped git grep since last tag, constrained to package dir)
   * 3. Filtering to only packages in filteredVersions
   */
  async buildPackageChangelogs(perPackageMessages, filteredVersions, tagCache) {
    const versionedPaths = new Set(Object.keys(filteredVersions));
    const packageChangelogs = {};

    const tasks = [];
    for (const [pkgPath, entries] of Object.entries(perPackageMessages)) {
      if (!versionedPaths.has(pkgPath)) continue;

      const pkgName = this.pathToPackageName(pkgPath);
      if (!pkgName) continue;

      const tag = tagCache.get(pkgPath) || null;

      const validationTasks = entries.map((entry) =>
        this.validationQueue.add(async () => ({
          ...entry,
          valid: await this.validateMessageBelongsToPackage(
            entry.message,
            pkgPath,
            tag,
          ),
        })),
      );

      tasks.push(
        Promise.all(validationTasks).then((validated) => {
          const validEntries = validated.filter((v) => v.valid);
          if (validEntries.length > 0) {
            packageChangelogs[pkgName] = {
              version: filteredVersions[pkgPath]?.version || "0.0.0",
              changelog: validEntries.map((v) => ({
                type: v.type,
                description: v.message,
              })),
            };
          } else {
            console.log(
              `  No validated messages for ${pkgName}, skipping`,
            );
          }
        }),
      );
    }

    await Promise.all(tasks);
    return packageChangelogs;
  }

  determineChangeType(version, changelog) {
    const hasBreaking = changelog.some((c) => c.type === "breaking changes");
    const hasFeatures = changelog.some((c) => c.type === "features");
    if (hasBreaking) return "major";
    if (hasFeatures) return "minor";
    return "patch";
  }

  parseReleaseFile(content) {
    const packages = {};
    const lines = content.split("\n");

    for (const line of lines) {
      const versionMatch = line.match(
        /Would add the following to (.+)\/package\.json: version = (.+)/,
      );
      if (versionMatch) {
        const packagePath = versionMatch[1];
        const version = versionMatch[2];
        packages[packagePath] = { version, changelog: [] };
      }
    }
    return packages;
  }

  LOCKFILE_ONLY_PATTERNS = [
    /pnpm-lock\.yaml$/,
    /package-lock\.json$/,
    /yarn\.lock$/,
  ];

  async filterToChangedPackages(packageVersions) {
    const filtered = {};

    for (const [pkgPath, info] of Object.entries(packageVersions)) {
      const pkgName = this.pathToPackageName(pkgPath);
      if (!pkgName) continue;

      const tag = await this.getLatestPackageTag(pkgName);

      if (!tag) {
        filtered[pkgPath] = info;
        continue;
      }

      const diffArgs = ["diff", "--name-only", `${tag}..HEAD`, "--", pkgPath];

      const output = await this.git.raw(diffArgs);

      const changedFiles = output
        .trim()
        .split("\n")
        .filter((f) => f.trim());
      const hasSourceChanges = changedFiles.some(
        (f) => !this.LOCKFILE_ONLY_PATTERNS.some((p) => p.test(f.trim())),
      );

      if (hasSourceChanges) {
        filtered[pkgPath] = info;
      } else {
        console.log(
          `  Skipping ${pkgName}: only lockfile changes since ${tag || "beginning"}`,
        );
      }
    }
    return filtered;
  }

  async getLatestPackageTag(pkgName) {
    try {
      const tagPrefix = `${pkgName}/v`;
      const output = await this.git.raw([
        "tag",
        "-l",
        `${tagPrefix}*`,
        "--sort=-creatordate",
      ]);
      const tags = output.trim().split("\n").filter(Boolean);
      return tags[0] || null;
    } catch {
      return null;
    }
  }

  pathToPackageName(pkgPath) {
    for (const [name, p] of Object.entries(this.packageNameToPath || {})) {
      if (p === pkgPath) return name;
    }
    return null;
  }

  async createChangesetFile(packages, changelogItems) {
    const grouped = {};
    for (const item of changelogItems) {
      const type = item.type.charAt(0).toUpperCase() + item.type.slice(1);
      if (!grouped[type]) grouped[type] = [];
      grouped[type].push(item.description);
    }

    let summary = "";
    for (const [type, items] of Object.entries(grouped)) {
      summary += `## ${type}\n\n`;
      for (const item of items) summary += `- ${item}\n`;
      summary += "\n";
    }

    const releases = [];
    for (const [pkg, data] of Object.entries(packages)) {
      const changeType = this.determineChangeType(data.version, data.changelog);
      releases.push({ name: pkg, type: changeType });
    }

    console.log(`\n  Changeset for: ${releases.map((r) => r.name).join(", ")}`);
    console.log(`  Releases: ${JSON.stringify(releases)}`);

    if (this.dryRun) {
      console.log(`  Summary preview:\n${summary}`);
      return "dry-run-" + Date.now();
    }

    const changesetID = await writeChangeset(
      { summary: summary.trim(), releases },
      this.packagesDir,
    );

    // Remove quotes from package names in the generated changeset file
    const changesetPath = path.join(this.changesetsDir, `${changesetID}.md`);
    let changesetContent = fs.readFileSync(changesetPath, "utf-8");
    
    // Remove quotes around package names (but keep quotes for other values if any)
    changesetContent = changesetContent.replace(/^"([^"]+)":/gm, "$1:");
    
    fs.writeFileSync(changesetPath, changesetContent, "utf-8");
    
    return changesetID;
  }

  async generate() {
    if (!this.packageNameToPath) {
      await this.initialize();
    }

    let releaseOutput = "";

    try {
      console.log("Temporarily modifying knope.toml...");
      await this.modifyKnopeConfig((config) => {
        config.changes = config.changes || {};
        config.changes.ignore_conventional_commits = false;
      });

      releaseOutput = await this.runKnopeDryRun();
      console.log("Restoring knope.toml...");
      await this.restoreKnopeConfig();
    } catch (error) {
      await this.restoreKnopeConfig();
      throw error;
    }

    const packageVersions = this.parseReleaseFile(releaseOutput);

    if (Object.keys(packageVersions).length === 0) {
      console.warn("No packages found in release output");
      return [];
    }

    console.log(
      `Found ${Object.keys(packageVersions).length} packages in release output`,
    );

    console.log("\nFiltering to packages with source changes...");
    const filteredVersions =
      await this.filterToChangedPackages(packageVersions);
    console.log(
      `Filtered to ${Object.keys(filteredVersions).length} packages with actual source changes`,
    );

    const perPackageMessages =
      this.extractPerPackageChangelogMessages(releaseOutput);
    const totalMessages = Object.values(perPackageMessages).reduce(
      (sum, entries) => sum + entries.length,
      0,
    );
    console.log(
      `Extracted changelog messages for ${Object.keys(perPackageMessages).length} packages (${totalMessages} total entries)`,
    );

    const tagCache = new Map();
    for (const pkgPath of Object.keys(filteredVersions)) {
      const pkgName = this.pathToPackageName(pkgPath);
      if (pkgName) {
        const tag = await this.getLatestPackageTag(pkgName);
        tagCache.set(pkgPath, tag);
      }
    }

    console.log("\nValidating changelog messages against package scopes...");
    const packageChangelogs = await this.buildPackageChangelogs(
      perPackageMessages,
      filteredVersions,
      tagCache,
    );
    console.log(
      "Packages with validated changelogs:",
      Object.keys(packageChangelogs).length,
    );

    const createdFiles = [];
    const changesetTasks = Object.entries(packageChangelogs).map(
      ([pkg, data]) =>
        this.changesetQueue.add(async () => {
          return await this.createChangesetFile(
            { [pkg]: data },
            data.changelog,
          );
        }),
    );
    const results = await Promise.all(changesetTasks);
    createdFiles.push(...results);
    return createdFiles;
  }
}

async function main() {
  const generator = new ChangesetGenerator({
    knopeConfigFile: cli.flags.knopeConfig,
    changesetsDir: cli.flags.changesetsDir,
    packagesDir: cli.flags.packagesDir,
    dryRun: cli.flags.dryRun,
  });

  const createdFiles = await generator.generate();

  console.log("\nDone! Changesets created:", createdFiles);
  console.log(
    "\nReview the changelogs and adjust as needed before running the release.",
  );
}

main();
