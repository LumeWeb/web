#!/usr/bin/env python3
"""
Release Go modules script

Builds portal apps and plugins, then exports their static assets to Go module directories.
Uses git revision as version identifier instead of tags.
"""

import argparse
import json
import logging
import os
import shutil
import subprocess
import sys
from pathlib import Path
from typing import Dict, List, Tuple, Optional


def setup_logging(verbose: bool = False) -> logging.Logger:
    """
    Configure logging for the script.

    Args:
        verbose: Whether to enable DEBUG level logging

    Returns:
        Configured logger instance
    """
    level = logging.DEBUG if verbose else logging.INFO
    logging.basicConfig(
        level=level,
        format='%(asctime)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    return logging.getLogger(__name__)


# Global logger instance (set in main())
logger = logging.getLogger(__name__)


# App shell app name (has multiple build variations)
APP_SHELL = "portal-app-shell"

# App shell variations (each built to a separate dist subdirectory)
# Maps variation names to (local_go_folder, ci_dispatch_target)
# Local folder: path under go/ (e.g., go/portal-dashboard/build)
# CI dispatch: target repository name for downstream workflows
APP_SHELL_VARIATIONS = {
    "dashboard": ("portal-dashboard", "portal-plugin-dashboard"),
    "admin": ("portal-admin", "portal-plugin-admin")
}

# Apps that map to plugin repositories instead of app repositories
# Format: {app_name: plugin_repo_name}
APP_TO_PLUGIN_MAPPING = {
    "portal-frontend": "portal-plugin-frontend"
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

# Special values for apps/plugins arguments
VALUE_ALL = "all"
VALUE_NONE = "none"


def normalize_arg_value(value: Optional[str]) -> str:
    """
    Normalize an argument value by stripping whitespace and quotes.

    Args:
        value: Argument value string or None

    Returns:
        Normalized string (lowercase, stripped of whitespace and quotes)
    """
    if not value:
        return ""
    
    value = value.strip()
    
    # Remove surrounding quotes (single or double)
    if (value.startswith("'") and value.endswith("'")) or \
       (value.startswith('"') and value.endswith('"')):
        value = value[1:-1]
    
    return value.lower().strip()


def parse_csv_list(value: Optional[str]) -> List[str]:
    """
    Parse a comma-separated string into a list, trimming whitespace and quotes.

    Args:
        value: CSV string or None

    Returns:
        List of trimmed strings, or empty list if value is None or "none"
    """
    # Normalize and check for "none"
    normalized = normalize_arg_value(value)
    if not normalized or normalized == VALUE_NONE:
        return []

    # Split by comma, strip whitespace, and remove surrounding quotes
    items = []
    for item in value.split(","):
        item = item.strip()
        if item:
            # Remove surrounding quotes (single or double)
            if (item.startswith("'") and item.endswith("'")) or \
               (item.startswith('"') and item.endswith('"')):
                item = item[1:-1]

            # Reject potentially dangerous characters (path traversal, shell metacharacters)
            dangerous_chars = ['/', '\\', '..', '|', '&', ';', '$', '`', '(', ')', '<', '>']
            if any(char in item for char in dangerous_chars):
                logger.warning(f"Invalid characters in '{item}' - skipping")
                continue

            # Reject empty strings after stripping
            if not item:
                continue

            items.append(item)
    return items



def get_package_name(name: str, prefix: str = "") -> str:
    """
    Get the package name using the @lumeweb naming convention.

    Args:
        name: Name of the package (e.g., portal-frontend, ipfs)
        prefix: Optional prefix to add (e.g., "portal-plugin-")

    Returns:
        Package name for turbo --filter (e.g., @lumeweb/portal-frontend)
    """
    return f"{LUMEWEB_SCOPE}{prefix}{name}"


def validate_package_name(name: str, repo_root: Path, directory: str, prefix: str = "") -> bool:
    """
    Validate that a package name exists and is valid.

    Args:
        name: Name of the package to validate
        repo_root: Path to the repository root
        directory: Directory to check (APPS_DIR or LIBS_DIR)
        prefix: Optional prefix to add to name for path lookup

    Returns:
        True if the package is valid, False otherwise
    """
    # Allow portal-app-shell
    if name == APP_SHELL:
        return True

    # Check if directory exists
    package_path = repo_root / directory / f"{prefix}{name}"
    if package_path.exists() and package_path.is_dir():
        # Verify it has a package.json
        package_json = package_path / "package.json"
        if package_json.exists():
            return True

    return False


def sanitize_package_names(names: List[str], repo_root: Path, directory: str, 
                           prefix: str = "") -> List[str]:
    """
    Sanitize and validate a list of package names.

    Args:
        names: List of package names to validate
        repo_root: Path to the repository root
        directory: Directory to check (APPS_DIR or LIBS_DIR)
        prefix: Optional prefix to add to name for path lookup
        verbose: Whether to print verbose output

    Returns:
        List of valid package names
    """
    valid_names = []
    for name in names:
        if validate_package_name(name, repo_root, directory, prefix):
            valid_names.append(name)
        else:
            logger.warning(f"Invalid package name '{name}' - skipping")
            logger.info(f"  Expected directory: {repo_root / directory / f'{prefix}{name}'}")
    return valid_names


def list_available_apps(repo_root: Path) -> List[str]:
    """
    List all available apps in the repository.

    Args:
        repo_root: Path to the repository root

    Returns:
        List of app names
    """
    apps_dir = repo_root / APPS_DIR
    apps = []
    if apps_dir.exists() and apps_dir.is_dir():
        for item in apps_dir.iterdir():
            if item.is_dir() and (item / "package.json").exists():
                apps.append(item.name)
    return sorted(apps)


def list_available_plugins(repo_root: Path) -> List[str]:
    """
    List all available plugins in the repository.

    Args:
        repo_root: Path to the repository root

    Returns:
        List of plugin names (without portal-plugin- prefix)
    """
    libs_dir = repo_root / LIBS_DIR
    plugins = []
    if libs_dir.exists() and libs_dir.is_dir():
        for item in libs_dir.iterdir():
            if item.is_dir() and item.name.startswith(PLUGIN_PREFIX) and (item / "package.json").exists():
                plugins.append(item.name[len(PLUGIN_PREFIX):])
    return sorted(plugins)


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
            logger.error(f"Command failed: {' '.join(cmd)}")
            logger.error(f"Exit code: {e.returncode}")
            if e.stdout:
                logger.error(f"STDOUT:\n{e.stdout}")
            if e.stderr:
                logger.error(f"STDERR:\n{e.stderr}")
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


def get_build_output_dir(name: str, repo_root: Path, directory: str = APPS_DIR, prefix: str = "") -> Path:
    """
    Determine the build output directory for an app or plugin.

    Args:
        name: Name of the app or plugin
        repo_root: Path to the repository root
        directory: Directory to check (APPS_DIR or LIBS_DIR)
        prefix: Optional prefix to add to name for path lookup

    Returns:
        Path to the build output directory

    Raises:
        AppReleaseError: If no valid build directory is found
    """
    # Check possible build directories
    package_path = repo_root / directory / f"{prefix}{name}"

    possible_dirs = [
        package_path / "dist",
        package_path / "build" / "client",
    ]

    for build_dir in possible_dirs:
        if build_dir.exists() and build_dir.is_dir():
            return build_dir

    raise AppReleaseError(f"No build output directory found for {prefix}{name}")


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
    repo_root: Path
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
        package_name = get_package_name(app_name)
        filters.extend(["--filter", package_name])
        logger.debug(f"Will build app: {package_name}")

    for plugin_name in plugin_names:
        package_name = get_package_name(plugin_name, PLUGIN_PREFIX)
        filters.extend(["--filter", package_name])
        logger.debug(f"Will build plugin: {package_name}")

    # Build all packages in a single turbo command with all tasks
    cmd = ["pnpm", "turbo", "run"] + tasks + filters

    logger.debug(f"Running: {' '.join(cmd)}")

    result = run_command(cmd, cwd=repo_root)

    if result.stdout:
        logger.debug(result.stdout)


def copy_build_to_go(
    app_name: str,
    build_dir: Path,
    repo_root: Path
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

    logger.debug(f"Copying {app_name} build to Go directory...")

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
        logger.debug(f"  Removing .vite directory from {app_name}")
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
        verbose: Whether to print verbose output (deprecated, use logging level instead)

    Returns:
        Tuple of (success: bool, commit_hash: str)
    """
    if not modified_apps:
        logger.debug("No modified apps to commit")
        return False, ""

    logger.debug(f"Modified apps: {', '.join(modified_apps)}")

    # Create commit message with versions
    commit_lines = ["chore: export app and plugin builds", ""]
    for app_name in modified_apps:
        version = versions.get(app_name, "unknown")
        commit_lines.append(f"* {app_name}@{version}")

    commit_message = "\n".join(commit_lines)

    logger.debug(f"Commit message:\n{commit_message}")

    # Create commit
    result = run_command(["git", "commit", "-m", commit_message], cwd=repo_root)

    # Get the commit hash
    commit_result = run_command(["git", "rev-parse", "HEAD"], cwd=repo_root)
    commit_hash = commit_result.stdout.strip()

    logger.debug(f"Commit created: {commit_hash}")

    return True, commit_hash


def write_metadata_files(modified_apps: List[str], repo_root: Path, verbose: bool = False) -> None:
    """
    Write metadata files for downstream workflow steps.

    Args:
        modified_apps: List of modified app names
        repo_root: Path to the repository root
        verbose: Whether to print verbose output
    """
    tmp_dir = Path("/tmp")

    # Write modified apps
    modified_apps_file = tmp_dir / "modified_apps.txt"
    content = "\n".join(modified_apps)
    
    modified_apps_file.write_text(content)
    
    if verbose and modified_apps:
        logger.debug(f"Writing metadata for dispatch: {', '.join(modified_apps)}")


def collect_versions(apps_to_build: List[str], plugins_to_build: List[str], 
                     app_shell_variations: List[Tuple[str, str]], repo_root: Path) -> Dict[str, str]:
    """
    Collect versions from package.json for all built packages.

    Args:
        apps_to_build: List of app names to build
        plugins_to_build: List of plugin names to build
        app_shell_variations: List of (local_folder, ci_target) tuples for app-shell variations
        repo_root: Path to the repository root

    Returns:
        Dictionary mapping package names to version strings
    """
    versions = {}
    for app_name in apps_to_build:
        if app_name == APP_SHELL:
            # Skip portal-app-shell in versions, use variations instead
            continue
        version = get_app_version(app_name, repo_root)
        # Map apps to plugin repos if they have a mapping
        target_repo = APP_TO_PLUGIN_MAPPING.get(app_name, app_name)
        versions[target_repo] = version

    # Add versions for app-shell variations (use ci_target for version mapping)
    if app_shell_variations:
        app_shell_version = get_app_version(APP_SHELL, repo_root)
        for _, ci_target in app_shell_variations:
            versions[ci_target] = app_shell_version

    for plugin_name in plugins_to_build:
        full_plugin_name = f"{PLUGIN_PREFIX}{plugin_name}"
        version = get_app_version(full_plugin_name, repo_root)
        versions[full_plugin_name] = version

    return versions


def get_modified_apps_list(apps_to_build: List[str], plugins_to_build: List[str],
                          app_shell_variations: List[Tuple[str, str]]) -> List[str]:
    """
    Build the list of modified apps for commit message.

    Args:
        apps_to_build: List of app names to build
        plugins_to_build: List of plugin names to build
        app_shell_variations: List of (local_folder, ci_target) tuples for app-shell variations

    Returns:
        List of modified app names (mapped to target repositories)
    """
    modified_apps = []
    for app_name in apps_to_build:
        if app_name == APP_SHELL or app_name == "none":
            continue
        # Map apps to plugin repos if they have a mapping
        if app_name in APP_TO_PLUGIN_MAPPING:
            modified_apps.append(APP_TO_PLUGIN_MAPPING[app_name])
        else:
            modified_apps.append(app_name)
    # Extract ci_target from tuples for commit message
    modified_apps.extend([ci_target for _, ci_target in app_shell_variations])
    modified_apps.extend([f"{PLUGIN_PREFIX}{p}" for p in plugins_to_build])
    return modified_apps


def collect_go_paths(apps_to_build: List[str], plugins_to_build: List[str],
                     app_shell_variations: List[Tuple[str, str]]) -> List[str]:
    """
    Build the list of Go build paths to stage.

    Args:
        apps_to_build: List of app names to build
        plugins_to_build: List of plugin names to build
        app_shell_variations: List of (local_folder, ci_target) tuples for app-shell variations

    Returns:
        List of Go build paths
    """
    go_paths = []
    for app_name in apps_to_build:
        if app_name == APP_SHELL or app_name == "none":
            continue
        # Map apps to plugin repos if they have a mapping
        target_repo = APP_TO_PLUGIN_MAPPING.get(app_name, app_name)
        go_paths.append(f"go/{target_repo}/build")
    # Extract local_folder from tuples for path construction
    go_paths.extend([f"go/{local_folder}/build" for local_folder, _ in app_shell_variations])
    go_paths.extend([f"go/{PLUGIN_PREFIX}{plugin_name}/build" for plugin_name in plugins_to_build])
    return go_paths


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

    # Setup logging
    logger = setup_logging(args.verbose)
    logger.info("Starting Go module release script")

    # Get repository root (needed for validation)
    repo_root = Path(__file__).parent.parent.resolve()
    logger.info(f"Repository root: {repo_root}")

    # Parse apps and plugins arguments
    apps_arg = normalize_arg_value(args.apps)
    if apps_arg == VALUE_ALL:
        apps_to_build = DEFAULT_APPS
    elif apps_arg == VALUE_NONE:
        apps_to_build = []
    else:
        apps_to_build = parse_csv_list(args.apps)
        # Validate app names
        apps_to_build = sanitize_package_names(apps_to_build, repo_root, APPS_DIR)

    plugins_arg = normalize_arg_value(args.plugins)
    if plugins_arg == VALUE_ALL:
        plugins_to_build = DEFAULT_PLUGINS
    elif plugins_arg == VALUE_NONE:
        plugins_to_build = []
    else:
        plugins_to_build = parse_csv_list(args.plugins)
        # Validate plugin names
        plugins_to_build = sanitize_package_names(plugins_to_build, repo_root, LIBS_DIR, PLUGIN_PREFIX)

    logger.info(f"Apps to build: {', '.join(apps_to_build) if apps_to_build else 'none'}")
    logger.info(f"Plugins to build: {', '.join(plugins_to_build) if plugins_to_build else 'none'}")

    if args.verbose:
        logger.debug(f"Repository root: {repo_root}")
        logger.debug(f"Apps to build: {', '.join(apps_to_build) if apps_to_build else 'none'}")
        logger.debug(f"Plugins to build: {', '.join(plugins_to_build) if plugins_to_build else 'none'}")

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
        logger.error("No valid apps or plugins to build. All provided names were invalid or skipped.")
        logger.error(f"Available apps: {', '.join(list_available_apps(repo_root))}")
        logger.error(f"Available plugins: {', '.join(list_available_plugins(repo_root))}")
        sys.exit(1)

    # Get current git revision (version)
    try:
        git_revision = get_git_revision(repo_root)
        if args.verbose:
            logger.debug(f"Git revision: {git_revision}")
    except Exception as e:
        logger.error(f"Error getting git revision: {e}")
        sys.exit(1)

    # Build all apps and plugins in a single turbo command
    try:
        build_packages(apps_to_build, plugins_to_build, repo_root, args.verbose)
    except Exception as e:
        logger.error(f"Error building packages: {e}")
        if args.verbose:
            logger.debug(traceback.format_exc())
        sys.exit(1)

    # Special handling for portal-app-shell variations
    # List of (local_folder, ci_target) tuples for each variation
    app_shell_variations = []
    if APP_SHELL in apps_to_build:
        try:
            app_shell_path = repo_root / "apps" / APP_SHELL

            # Copy each variation to its corresponding Go directory
            for variation, (local_folder, ci_target) in APP_SHELL_VARIATIONS.items():
                variation_build_dir = app_shell_path / "dist" / variation
                if variation_build_dir.exists() and variation_build_dir.is_dir():
                    if args.verbose:
                        logger.debug(f"Copying {APP_SHELL} {variation} build to go/{local_folder}/build...")
                    copy_build_to_go(local_folder, variation_build_dir, repo_root)
                    app_shell_variations.append((local_folder, ci_target))

        except Exception as e:
            logger.error(f"Error processing {APP_SHELL} variations: {e}")
            if args.verbose:
                logger.debug(traceback.format_exc())

    # Copy each app's build output to Go directory (excluding portal-app-shell)
    for app_name in apps_to_build:
        if app_name == APP_SHELL:
            continue  # Skip portal-app-shell, handled above

        try:
            # Get build output directory
            build_dir = get_build_output_dir(app_name, repo_root, APPS_DIR)
            if args.verbose:
                logger.debug(f"Build directory: {build_dir}")

            # Map apps to plugin repos if they have a mapping
            target_repo = APP_TO_PLUGIN_MAPPING.get(app_name, app_name)
            
            # Copy to Go directory (always replace)
            copy_build_to_go(target_repo, build_dir, repo_root)

        except Exception as e:
            logger.error(f"Error processing {app_name}: {e}")
            if args.verbose:
                logger.debug(traceback.format_exc())
            continue

    # Copy each plugin's build output to Go directory
    for plugin_name in plugins_to_build:
        try:
            # Get build output directory
            build_dir = get_build_output_dir(plugin_name, repo_root, LIBS_DIR, PLUGIN_PREFIX)
            if args.verbose:
                logger.debug(f"Build directory: {build_dir}")

            # Copy to Go directory (always replace)
            copy_build_to_go(f"{PLUGIN_PREFIX}{plugin_name}", build_dir, repo_root, args.verbose)

        except Exception as e:
            logger.error(f"Error processing plugin {plugin_name}: {e}")
            if args.verbose:
                logger.debug(traceback.format_exc())
            continue

    logger.debug("")  # Empty line for readability

    # Stage all Go build directories (apps and plugins, including app-shell variations)
    go_paths = collect_go_paths(apps_to_build, plugins_to_build, app_shell_variations)
    
    # Track which paths were actually staged for --force warning
    staged_paths = []
    for go_path in go_paths:
        go_dir = repo_root / go_path
        if go_dir.exists():
            run_command(["git", "add", str(go_dir)], cwd=repo_root)
            staged_paths.append(go_path)
        elif args.force:
            logger.warning(f"{go_path} does not exist, but --force is set")

    # Check if there are actual changes via git diff
    has_changes = get_git_diff(repo_root, go_paths)

    # Check if anything is actually staged (needed for --force case)
    has_staged = False
    try:
        result = run_command(["git", "diff", "--cached", "--quiet"], cwd=repo_root, check=False)
        has_staged = result.returncode == 1  # 1 means there are staged changes
    except Exception:
        pass

    # Get versions and modified apps list for metadata (needed regardless of changes)
    versions = collect_versions(apps_to_build, plugins_to_build, app_shell_variations, repo_root)
    modified_apps = get_modified_apps_list(apps_to_build, plugins_to_build, app_shell_variations)
    
    if args.verbose:
        logger.debug(f"Modified apps list to commit: {modified_apps}")

    if has_changes or (args.force and has_staged):
        if args.force and not has_changes:
            logger.warning("--force flag set, proceeding despite no git changes detected")
        
        # Get list of changed files for reporting
        changed_files = get_git_diff_files(repo_root, go_paths)
        if args.verbose and changed_files:
            logger.debug(f"Changed files ({len(changed_files)}):")
            for file in changed_files[:10]:  # Show first 10
                logger.debug(f"  - {file}")
            if len(changed_files) > 10:
                logger.debug(f"  ... and {len(changed_files) - 10} more")

        try:
            success, commit_hash = git_add_and_commit_modified(
                modified_apps,
                versions,
                repo_root,
                args.verbose
            )

            if success:
                write_metadata_files(modified_apps, repo_root, args.verbose)
                set_github_output("commit_hash", commit_hash)

                # Handle dry-run and no-push flags
                if args.dry_run:
                    logger.info("Dry run - skipping push")
                    return
                if args.no_push:
                    logger.info("No-push flag set - skipping push")
                    return

                # Push changes
                try:
                    run_command(["git", "push", "origin", "HEAD"], cwd=repo_root)
                    if args.verbose:
                        logger.debug("Changes pushed successfully")
                except Exception as e:
                    logger.error(f"Error pushing changes: {e}")
                    sys.exit(1)
            else:
                logger.error("No commit created")
                sys.exit(1)
        except Exception as e:
            logger.error(f"Error creating commit: {e}")
            sys.exit(1)
    elif args.force and not has_staged:
        logger.warning("--force flag set but nothing was staged (no build outputs found)")
        write_metadata_files(modified_apps, repo_root, args.verbose)
    else:
        logger.info("No changes detected in any apps")
        # Still write metadata so downstream workflows know what was processed
        write_metadata_files(modified_apps, repo_root, args.verbose)


if __name__ == "__main__":
    main()
