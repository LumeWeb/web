#!/usr/bin/env python3
"""
Release Go modules script

Builds portal apps and plugins, then exports their static assets to Go module directories.
Uses git revision as version identifier instead of tags.
"""

import argparse
import json
import os
import shutil
import subprocess
import sys
from pathlib import Path
from typing import Dict, List, Tuple, Optional


# App shell app name (has multiple build variations)
APP_SHELL = "portal-app-shell"

# App shell variations (each built to a separate dist subdirectory)
# Maps variation names to their target Go repository names
APP_SHELL_VARIATIONS = {
    "dashboard": "portal-plugin-dashboard",
    "admin": "portal-plugin-admin"
}

# Package name prefixes
PLUGIN_PREFIX = "portal-plugin-"
APP_PREFIX = "portal-"

# Directory names in the repo
APPS_DIR = "apps"
LIBS_DIR = "libs"
LUMEWEB_SCOPE = "@lumeweb/"

# Default apps to build and release
# Used when --apps=all is specified
DEFAULT_APPS = ["portal-frontend", APP_SHELL]

# Default plugins to build and release
# Used when --plugins=all is specified
# Note: dashboard and admin are built via APP_SHELL variations, not standalone plugins
DEFAULT_PLUGINS = ["ipfs", "core", "lbry"]


def parse_csv_list(value: Optional[str]) -> List[str]:
    """
    Parse a comma-separated string into a list, trimming whitespace.

    Args:
        value: CSV string or None

    Returns:
        List of trimmed strings, or empty list if value is None or "none"
    """
    if not value or value.lower() == "none":
        return []

    return [item.strip() for item in value.split(",") if item.strip()]


def get_app_package_name(app_name: str) -> str:
    """
    Get the package name for an app using the @lumeweb naming convention.

    Args:
        app_name: Name of the app (e.g., portal-frontend, portal-app-shell)

    Returns:
        Package name for turbo --filter (e.g., @lumeweb/portal-frontend)
    """
    return f"{LUMEWEB_SCOPE}{app_name}"


def get_plugin_package_name(plugin_name: str) -> str:
    """
    Get the package name for a plugin using the @lumeweb naming convention.

    Args:
        plugin_name: Name of the plugin (without portal-plugin- prefix)

    Returns:
        Package name for turbo --filter (e.g., @lumeweb/portal-plugin-dashboard)
    """
    return f"{LUMEWEB_SCOPE}{PLUGIN_PREFIX}{plugin_name}"


def set_github_output(name: str, value: str) -> None:
    """
    Set a GitHub Actions output using the GITHUB_OUTPUT environment file.

    Args:
        name: Output name
        value: Output value
    """
    github_output = os.environ.get("GITHUB_OUTPUT")
    if github_output:
        with open(github_output, "a") as f:
            f.write(f"{name}={value}\n")
    else:
        # Fallback to stdout if not in GitHub Actions
        print(f"{name}={value}")


class AppReleaseError(Exception):
    """Custom exception for app release errors."""
    pass


def run_command(cmd: List[str], cwd: Path = None, check: bool = True) -> subprocess.CompletedProcess:
    """
    Run a shell command and return the result.

    Args:
        cmd: Command and arguments as list
        cwd: Working directory (default: current directory)
        check: Whether to raise exception on non-zero exit code

    Returns:
        CompletedProcess object with stdout/stderr
    """
    try:
        result = subprocess.run(
            cmd,
            cwd=cwd,
            check=check,
            capture_output=True,
            text=True
        )
        return result
    except subprocess.CalledProcessError as e:
        if check:
            print(f"Command failed: {' '.join(cmd)}", file=sys.stderr)
            print(f"Exit code: {e.returncode}", file=sys.stderr)
            if e.stdout:
                print(f"STDOUT:\n{e.stdout}", file=sys.stderr)
            if e.stderr:
                print(f"STDERR:\n{e.stderr}", file=sys.stderr)
            raise AppReleaseError(f"Command failed: {' '.join(cmd)}")
        return e


def get_git_revision(repo_root: Path) -> str:
    """
    Get the current git revision (SHA).

    Args:
        repo_root: Path to the git repository root

    Returns:
        Current git revision SHA
    """
    result = run_command(["git", "rev-parse", "HEAD"], cwd=repo_root)
    return result.stdout.strip()


def get_git_diff(repo_root: Path, paths: List[str]) -> bool:
    """
    Check if there are any git changes in the specified paths.

    Args:
        repo_root: Path to the git repository root
        paths: List of paths to check for changes

    Returns:
        True if there are changes, False otherwise
    """
    try:
        # Check for staged changes - pass paths as separate arguments
        result = run_command(
            ["git", "diff", "--cached", "--quiet", "--"] + paths,
            cwd=repo_root,
            check=False
        )
        if result.returncode == 0:
            # No staged changes
            return False
        elif result.returncode == 1:
            # There are staged changes
            return True
        else:
            # Error - assume no changes to be safe
            return False
    except Exception:
        return False


def get_git_diff_files(repo_root: Path, paths: List[str]) -> List[str]:
    """
    Get list of changed files in the specified paths.

    Args:
        repo_root: Path to the git repository root
        paths: List of paths to check for changes

    Returns:
        List of changed files
    """
    try:
        result = run_command(
            ["git", "diff", "--cached", "--name-only", "--"] + paths,
            cwd=repo_root,
            check=False
        )
        if result.returncode == 0:
            return [line.strip() for line in result.stdout.splitlines() if line.strip()]
        return []
    except Exception:
        return []


def get_build_output_dir(app_name: str, repo_root: Path) -> Path:
    """
    Determine the build output directory for an app.

    Args:
        app_name: Name of the app
        repo_root: Path to the repository root

    Returns:
        Path to the build output directory

    Raises:
        AppReleaseError: If no valid build directory is found
    """
    # Check possible build directories
    app_path = repo_root / "apps" / app_name

    possible_dirs = [
        app_path / "build" / "client",
        app_path / "dist",
    ]

    for build_dir in possible_dirs:
        if build_dir.exists() and build_dir.is_dir():
            return build_dir

    raise AppReleaseError(f"No build output directory found for {app_name}")


def get_app_version(app_name: str, repo_root: Path) -> str:
    """
    Get the version from package.json for an app or plugin.

    Args:
        app_name: Name of the app or plugin (with or without portal- prefix)
        repo_root: Path to the repository root

    Returns:
        Version string from package.json
    """
    # Determine if it's an app or plugin
    # Check for portal-plugin-* first (more specific pattern)
    if app_name.startswith(PLUGIN_PREFIX):
        path = repo_root / LIBS_DIR / app_name
    elif app_name.startswith(APP_PREFIX):
        path = repo_root / APPS_DIR / app_name
    else:
        # Try both locations
        app_path = repo_root / APPS_DIR / app_name
        plugin_path = repo_root / LIBS_DIR / f"{PLUGIN_PREFIX}{app_name}"
        path = app_path if app_path.exists() else plugin_path

    package_json_path = path / "package.json"

    if not package_json_path.exists():
        return "unknown"

    try:
        with open(package_json_path, "r") as f:
            package_data = json.load(f)
        return package_data.get("version", "unknown")
    except (json.JSONDecodeError, IOError):
        return "unknown"


def build_packages(
    app_names: List[str],
    plugin_names: List[str],
    repo_root: Path,
    verbose: bool = False
) -> None:
    """
    Build multiple apps and plugins using a single turbo command for maximum caching.

    Args:
        app_names: List of app names to build
        plugin_names: List of plugin names to build (without portal-plugin- prefix)
        repo_root: Path to the repository root
        verbose: Whether to print verbose output
    """
    if not app_names and not plugin_names:
        return

    # Build task list: standard build + app-shell variations
    tasks = ["build"]
    if APP_SHELL in app_names:
        tasks.extend([f"build:{variation}" for variation in APP_SHELL_VARIATIONS.keys()])

    # Build filter list for turbo
    filters = []

    for app_name in app_names:
        package_name = get_app_package_name(app_name)
        filters.extend(["--filter", package_name])
        if verbose:
            print(f"Will build app: {package_name}")

    for plugin_name in plugin_names:
        package_name = get_plugin_package_name(plugin_name)
        filters.extend(["--filter", package_name])
        if verbose:
            print(f"Will build plugin: {package_name}")

    # Build all packages in a single turbo command with all tasks
    cmd = ["pnpm", "turbo", "run"] + tasks + filters

    if verbose:
        print(f"Running: {' '.join(cmd)}")

    result = run_command(cmd, cwd=repo_root)

    if verbose and result.stdout:
        print(result.stdout)


def get_plugin_build_output_dir(plugin_name: str, repo_root: Path) -> Path:
    """
    Determine the build output directory for a plugin.

    Args:
        plugin_name: Name of the plugin (without portal-plugin- prefix)
        repo_root: Path to the repository root

    Returns:
        Path to the build output directory

    Raises:
        AppReleaseError: If no valid build directory is found
    """
    # Check possible build directories
    plugin_path = repo_root / LIBS_DIR / f"{PLUGIN_PREFIX}{plugin_name}"

    possible_dirs = [
        plugin_path / "dist",
        plugin_path / "build" / "client",
    ]

    for build_dir in possible_dirs:
        if build_dir.exists() and build_dir.is_dir():
            return build_dir

    raise AppReleaseError(f"No build output directory found for plugin {plugin_name}")


def copy_build_to_go(
    app_name: str,
    build_dir: Path,
    repo_root: Path,
    verbose: bool = False
) -> None:
    """
    Copy build output to Go module directory (always replace).

    Args:
        app_name: Name of the app (used as Go directory name)
        build_dir: Path to the build output directory
        repo_root: Path to the repository root
        verbose: Whether to print verbose output
    """
    go_build_dir = repo_root / "go" / app_name / "build"

    if verbose:
        print(f"Copying {app_name} build to Go directory...")

    # Remove existing build directory
    if go_build_dir.exists():
        shutil.rmtree(go_build_dir)

    # Create directory and copy new files
    go_build_dir.mkdir(parents=True, exist_ok=True)

    for item in build_dir.iterdir():
        if item.is_dir():
            shutil.copytree(item, go_build_dir / item.name)
        else:
            shutil.copy2(item, go_build_dir)

    # Prune .vite directories
    vite_dir = go_build_dir / ".vite"
    if vite_dir.exists() and vite_dir.is_dir():
        if verbose:
            print(f"  Removing .vite directory from {app_name}")
        shutil.rmtree(vite_dir)


def git_add_and_commit_modified(
    modified_apps: List[str],
    versions: Dict[str, str],
    repo_root: Path,
    verbose: bool = False
) -> Tuple[bool, str]:
    """
    Create a commit for modified Go directories (files should already be staged).

    Args:
        modified_apps: List of modified app names
        versions: Dictionary mapping app names to version strings
        repo_root: Path to the repository root
        verbose: Whether to print verbose output

    Returns:
        Tuple of (success: bool, commit_hash: str)
    """
    if not modified_apps:
        if verbose:
            print("No modified apps to commit")
        return False, ""

    if verbose:
        print(f"Modified apps: {', '.join(modified_apps)}")

    # Create commit message with versions
    commit_lines = ["chore: export app and plugin builds", ""]
    for app_name in modified_apps:
        version = versions.get(app_name, "unknown")
        commit_lines.append(f"* {app_name}@{version}")

    commit_message = "\n".join(commit_lines)

    if verbose:
        print(f"Commit message: {commit_message}")

    # Create commit
    result = run_command(["git", "commit", "-m", commit_message], cwd=repo_root)

    # Get the commit hash
    commit_result = run_command(["git", "rev-parse", "HEAD"], cwd=repo_root)
    commit_hash = commit_result.stdout.strip()

    if verbose:
        print(f"Commit created: {commit_hash}")

    return True, commit_hash


def write_metadata_files(modified_apps: List[str], repo_root: Path) -> None:
    """
    Write metadata files for downstream workflow steps.

    Args:
        modified_apps: List of modified app names
        repo_root: Path to the repository root
    """
    tmp_dir = Path("/tmp")

    # Write modified apps
    modified_apps_file = tmp_dir / "modified_apps.txt"
    modified_apps_file.write_text("\n".join(modified_apps))


def main():
    parser = argparse.ArgumentParser(
        description="Build and release portal apps and plugins to Go modules",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Build all apps and plugins (default: all)
  python scripts/release-go.py

  # Build specific apps (CSV format)
  python scripts/release-go.py --apps portal-frontend,portal-app-shell

  # Build specific plugins (CSV format)
  python scripts/release-go.py --plugins dashboard,ipfs

  # Build specific apps and plugins
  python scripts/release-go.py --apps portal-frontend --plugins dashboard,ipfs

  # Skip apps, build only plugins
  python scripts/release-go.py --apps none --plugins all

  # Skip plugins, build only apps
  python scripts/release-go.py --apps all --plugins none

  # Dry run (build and check but don't commit)
  python scripts/release-go.py --dry-run

  # Verbose output
  python scripts/release-go.py --verbose

  # Get commit hash of last release commit
  python scripts/release-go.py --commit-hash

  # Create commit but don't push
  python scripts/release-go.py --no-push

  # Force release even if no changes detected (useful for initial releases)
  python scripts/release-go.py --plugins lbry --force
        """
    )

    parser.add_argument(
        "--apps",
        type=str,
        default="all",
        help="Apps to build and release (CSV format, 'all' for defaults, 'none' to skip)"
    )

    parser.add_argument(
        "--plugins",
        type=str,
        default="all",
        help="Plugins to build and release (CSV format, 'all' for defaults, 'none' to skip)"
    )

    parser.add_argument(
        "--verbose", "-v",
        action="store_true",
        help="Enable verbose output"
    )

    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Build and check for changes but don't commit"
    )

    parser.add_argument(
        "--commit-hash",
        action="store_true",
        help="Output the commit hash of the last release commit"
    )

    parser.add_argument(
        "--no-push",
        action="store_true",
        help="Create commit but do not push to remote"
    )

    parser.add_argument(
        "--force",
        action="store_true",
        help="Force release even if no git changes detected (useful for initial releases)"
    )

    args = parser.parse_args()

    # Parse apps and plugins arguments
    if args.apps.lower() == "all":
        apps_to_build = DEFAULT_APPS
    else:
        apps_to_build = parse_csv_list(args.apps)

    if args.plugins.lower() == "all":
        plugins_to_build = DEFAULT_PLUGINS
    else:
        plugins_to_build = parse_csv_list(args.plugins)

    # Get repository root
    repo_root = Path(__file__).parent.parent.resolve()

    if args.verbose:
        print(f"Repository root: {repo_root}")
        print(f"Apps to build: {', '.join(apps_to_build) if apps_to_build else 'none'}")
        print(f"Plugins to build: {', '.join(plugins_to_build) if plugins_to_build else 'none'}")

    # Handle --commit-hash flag
    if args.commit_hash:
        try:
            # Get the last commit message that matches our release pattern
            result = run_command(
                ["git", "log", "--grep", "^chore: export app and plugin builds$", "-1", "--format=%H"],
                cwd=repo_root
            )
            commit_hash = result.stdout.strip()
            if commit_hash:
                print(commit_hash)
            sys.exit(0)
        except Exception:
            sys.exit(1)

    # Early exit if nothing to build (unless --commit-hash)
    if not apps_to_build and not plugins_to_build:
        print("No apps or plugins specified to build", file=sys.stderr)
        sys.exit(1)

    # Get current git revision (version)
    try:
        git_revision = get_git_revision(repo_root)
        if args.verbose:
            print(f"Git revision: {git_revision}")
    except Exception as e:
        print(f"Error getting git revision: {e}", file=sys.stderr)
        sys.exit(1)

    # Build all apps and plugins in a single turbo command
    try:
        build_packages(apps_to_build, plugins_to_build, repo_root, args.verbose)
    except Exception as e:
        print(f"Error building packages: {e}", file=sys.stderr)
        if args.verbose:
            import traceback
            traceback.print_exc()
        sys.exit(1)

    # Special handling for portal-app-shell variations
    app_shell_variations = []
    if APP_SHELL in apps_to_build:
        try:
            app_shell_path = repo_root / "apps" / APP_SHELL

            # Copy each variation to its corresponding Go directory
            for variation, go_target in APP_SHELL_VARIATIONS.items():
                variation_build_dir = app_shell_path / "dist" / variation
                if variation_build_dir.exists() and variation_build_dir.is_dir():
                    if args.verbose:
                        print(f"Copying {APP_SHELL} {variation} build to go/{go_target}/build...")
                    copy_build_to_go(go_target, variation_build_dir, repo_root, args.verbose)
                    app_shell_variations.append(go_target)

        except Exception as e:
            print(f"Error processing {APP_SHELL} variations: {e}", file=sys.stderr)
            if args.verbose:
                import traceback
                traceback.print_exc()

    # Copy each app's build output to Go directory (excluding portal-app-shell)
    for app_name in apps_to_build:
        if app_name == APP_SHELL:
            continue  # Skip portal-app-shell, handled above

        try:
            # Get build output directory
            build_dir = get_build_output_dir(app_name, repo_root)
            if args.verbose:
                print(f"Build directory: {build_dir}")

            # Copy to Go directory (always replace)
            copy_build_to_go(app_name, build_dir, repo_root, args.verbose)

        except Exception as e:
            print(f"Error processing {app_name}: {e}", file=sys.stderr)
            if args.verbose:
                import traceback
                traceback.print_exc()
            continue

    # Copy each plugin's build output to Go directory
    for plugin_name in plugins_to_build:
        try:
            # Get build output directory
            build_dir = get_plugin_build_output_dir(plugin_name, repo_root)
            if args.verbose:
                print(f"Build directory: {build_dir}")

            # Copy to Go directory (always replace)
            copy_build_to_go(f"{PLUGIN_PREFIX}{plugin_name}", build_dir, repo_root, args.verbose)

        except Exception as e:
            print(f"Error processing plugin {plugin_name}: {e}", file=sys.stderr)
            if args.verbose:
                import traceback
                traceback.print_exc()
            continue

    print()  # Empty line for readability

    # Stage all Go build directories (apps and plugins, including app-shell variations)
    go_paths = [f"go/{app_name}/build" for app_name in apps_to_build if app_name != APP_SHELL]
    go_paths.extend([f"go/{variation}/build" for variation in app_shell_variations])
    go_paths.extend([f"go/{PLUGIN_PREFIX}{plugin_name}/build" for plugin_name in plugins_to_build])
    
    # Track which paths were actually staged for --force warning
    staged_paths = []
    for go_path in go_paths:
        go_dir = repo_root / go_path
        if go_dir.exists():
            run_command(["git", "add", str(go_dir)], cwd=repo_root)
            staged_paths.append(go_path)
        elif args.force:
            print(f"Warning: {go_path} does not exist, but --force is set", file=sys.stderr)

    # Check if there are actual changes via git diff
    has_changes = get_git_diff(repo_root, go_paths)

    if has_changes or args.force:
        if args.force and not has_changes:
            print(f"Warning: --force flag set, proceeding despite no git changes detected", file=sys.stderr)
        
        # Get list of changed files for reporting
        changed_files = get_git_diff_files(repo_root, go_paths)
        if args.verbose:
            print(f"Changed files: {len(changed_files)}")
            for file in changed_files[:10]:  # Show first 10
                print(f"  - {file}")
            if len(changed_files) > 10:
                print(f"  ... and {len(changed_files) - 10} more")

        # Get versions from package.json for commit message
        versions = {}
        for app_name in apps_to_build:
            if app_name == APP_SHELL:
                # Skip portal-app-shell in versions, use variations instead
                continue
            version = get_app_version(app_name, repo_root)
            versions[app_name] = version

        # Add versions for app-shell variations
        if app_shell_variations:
            app_shell_version = get_app_version(APP_SHELL, repo_root)
            for variation in app_shell_variations:
                versions[variation] = app_shell_version

        for plugin_name in plugins_to_build:
            full_plugin_name = f"{PLUGIN_PREFIX}{plugin_name}"
            version = get_app_version(full_plugin_name, repo_root)
            versions[full_plugin_name] = version

        # Create commit
        modified_apps = [name for name in apps_to_build if name != APP_SHELL] + app_shell_variations
        modified_apps.extend([f"{PLUGIN_PREFIX}{p}" for p in plugins_to_build])

        try:
            success, commit_hash = git_add_and_commit_modified(
                modified_apps,
                versions,
                repo_root,
                args.verbose
            )

            if success:
                write_metadata_files(modified_apps, repo_root)
                set_github_output("commit_hash", commit_hash)

                if args.verbose:
                    print(f"Commit created: {commit_hash}")

                if args.dry_run:
                    print("Dry run - skipping push", file=sys.stderr)
                    sys.exit(0)

                if args.no_push:
                    print("No-push flag set - skipping push", file=sys.stderr)
                    sys.exit(0)

                # Push changes
                try:
                    run_command(["git", "push", "origin", "HEAD"], cwd=repo_root)
                    if args.verbose:
                        print("Changes pushed successfully")
                except Exception as e:
                    print(f"Error pushing changes: {e}", file=sys.stderr)
                    sys.exit(1)

                sys.exit(0)
            else:
                print("No commit created", file=sys.stderr)
                sys.exit(1)
        except Exception as e:
            print(f"Error creating commit: {e}", file=sys.stderr)
            sys.exit(1)
    else:
        print("No changes detected in any apps")
        write_metadata_files([], repo_root)
        sys.exit(0)


if __name__ == "__main__":
    main()
