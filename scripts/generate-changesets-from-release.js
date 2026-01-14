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

    this.messageQueue = new PQueue({ concurrency: 10 });
    this.fileQueue = new PQueue({ concurrency: 20 });
    this.packageLookupQueue = new PQueue({ concurrency: 50 });
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
    const newContent = stringify(config);
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

  extractUniqueChangelogMessages(content) {
    const messages = new Set();
    const lines = content.split("\n");
    let inChangelog = false;

    for (const line of lines) {
      if (line.match(/CHANGELOG\.md:/)) {
        inChangelog = true;
        continue;
      }

      if ((line.startsWith("Would ") || line.startsWith("--")) && inChangelog) {
        inChangelog = false;
        continue;
      }

      if (inChangelog && line.startsWith("- ") && line.trim() !== "- ") {
        const message = line.substring(2).trim();
        if (message) messages.add(message);
      }
    }
    return Array.from(messages);
  }

  async findCommitsForMessage(message) {
    const output = await this.git.raw([
      "log",
      "--all",
      "--oneline",
      `--grep=${message}`,
    ]);
    const lines = output.trim().split("\n");
    const commits = [];
    for (const line of lines) {
      const match = line.match(/^([a-f0-9]+)\s+/);
      if (match) commits.push(match[1]);
    }
    return commits;
  }

  async getChangedFilesForCommit(commit) {
    try {
      const output = await this.git.show([commit, "--name-only", "--pretty="]);
      return output
        .trim()
        .split("\n")
        .filter((f) => f.trim());
    } catch (error) {
      return [];
    }
  }

  async findPackageForFileAtCommit(file, commit) {
    try {
      const parts = file.split(path.sep);
      for (let i = parts.length - 1; i >= 0; i--) {
        const possiblePath = parts.slice(0, i + 1).join(path.sep);
        const pkgJsonPath = path.join(possiblePath, "package.json");

        try {
          const output = await this.git.show([`${commit}:${pkgJsonPath}`]);
          const packageJson = JSON.parse(output);
          if (packageJson.name) {
            if (!this.packageNameToPath[packageJson.name]) {
              this.packageNameToPath[packageJson.name] = possiblePath;
              console.log(
                `    Added package from git history: ${packageJson.name} -> ${possiblePath}`,
              );
            }
            return packageJson.name;
          }
        } catch (e) {}
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  async findPackagesForFiles(fileData) {
    const packages = new Set();
    const tasks = fileData.map(({ file, commit }) =>
      this.packageLookupQueue.add(async () => {
        const packageName = await this.findPackageForFileAtCommit(file, commit);
        if (packageName) {
          packages.add(packageName);
        }
      }),
    );
    await Promise.all(tasks);
    return Array.from(packages);
  }

  async processSingleMessage(message) {
    console.log(`  Finding packages for: "${message.substring(0, 60)}..."`);

    const commits = await this.findCommitsForMessage(message);
    if (commits.length === 0) {
      console.log(`    No commits found for message`);
      return { packages: [], type: "features" };
    }

    const allFiles = [];
    const fileTasks = commits.map((commit) =>
      this.fileQueue.add(async () => {
        const files = await this.getChangedFilesForCommit(commit);
        return files.map((file) => ({ file, commit }));
      }),
    );
    const allFileResults = await Promise.all(fileTasks);
    allFiles.push(...allFileResults.flat());

    const packages = await this.findPackagesForFiles(allFiles);

    if (packages.length === 0) {
      console.log(`    No packages found for ${allFiles.length} changed files`);
      return { packages: [], type: "features" };
    }

    console.log(
      `    Found ${packages.length} package(s): ${packages.join(", ")}`,
    );
    return { packages, type: "features" };
  }

  async buildChangelogMessageMapping(messages) {
    const mapping = {};
    const seenMessages = new Set();

    const filteredMessages = messages.filter((msg) => !seenMessages.has(msg));
    const tasks = filteredMessages.map((message) =>
      this.messageQueue.add(() => this.processSingleMessage(message)),
    );
    const results = await Promise.all(tasks);

    filteredMessages.forEach((message, i) => {
      const result = results[i];
      if (result) {
        mapping[message] = result;
        seenMessages.add(message);
      }
    });
    return mapping;
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

  groupChangelogsByPackages(changelogMapping, packageVersions) {
    const packageChangelogs = {};

    for (const [message, data] of Object.entries(changelogMapping)) {
      for (const packageName of data.packages) {
        if (!packageChangelogs[packageName]) {
          packageChangelogs[packageName] = [];
        }
        packageChangelogs[packageName].push({
          type: data.type,
          description: message,
        });
      }
    }

    const result = {};
    for (const [pkgName, changelogs] of Object.entries(packageChangelogs)) {
      const pkgPath = this.packageNameToPath[pkgName];
      const versionInfo = pkgPath ? packageVersions[pkgPath] : null;

      if (changelogs.length > 0) {
        result[pkgName] = {
          version: versionInfo?.version || "0.0.0",
          changelog: changelogs,
        };
      }
    }
    return result;
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

    return await writeChangeset(
      { summary: summary.trim(), releases },
      this.packagesDir,
    );
  }

  async generate() {
    if (!this.packageNameToPath) {
      await this.initialize();
    }

    let releaseOutput = "";

    try {
      console.log("Temporarily modifying knope.toml...");
      await this.modifyKnopeConfig((config) => {
        for (const pkgKey of Object.keys(config.packages || {})) {
          config.packages[pkgKey].ignore_conventional_commits = false;
        }
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

    const uniqueMessages = this.extractUniqueChangelogMessages(releaseOutput);
    console.log(`Extracted ${uniqueMessages.length} unique changelog messages`);

    console.log("\nBuilding changelog message to packages mapping...");
    const changelogMapping =
      await this.buildChangelogMessageMapping(uniqueMessages);

    const packageChangelogs = this.groupChangelogsByPackages(
      changelogMapping,
      packageVersions,
    );
    console.log(
      "Packages with changelogs:",
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
