#!/usr/bin/env python3
"""
Release Go modules script - DSL Implementation

Builds portal apps and plugins with context-aware collision prevention.
Uses declarative DSL configuration for maintainable build definitions.
"""

import argparse
import json
import logging
import shutil
import subprocess
import sys
import traceback
from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, List, Optional, Set, Any, Union
from enum import Enum


# ============================================================================
# Core Data Structures
# ============================================================================

class BuildContextType(Enum):
    APP_SHELL = "app-shell"
    PLUGIN = "plugin"


class ContentType(Enum):
    UI_APPLICATION = "ui_application"
    PLUGIN_MODULE = "plugin_module"


@dataclass
class BuildContext:
    type: BuildContextType
    namespace: str
    identifier: str


@dataclass
class BuildTarget:
    name: str
    context: BuildContext
    source_path: Path
    target_path: Path
    repo_target: str
    content_type: ContentType
    dependencies: List[str] = field(default_factory=list)
    exposes: List[str] = field(default_factory=list)
    variants: List[str] = field(default_factory=list)
    merge_partners: List[str] = field(default_factory=list)  # Other targets that merge to same repo


@dataclass
class BuildRegistry:
    targets: Dict[str, BuildTarget]


# ============================================================================
# DSL Helper Functions
# ============================================================================

def ui_app(**kwargs) -> Dict[str, Any]:
    """Helper for UI application targets"""
    return {
        "type": "ui_application",
        **kwargs
    }


def plugin(**kwargs) -> Dict[str, Any]:
    """Helper for plugin targets"""
    return {
        "type": "plugin_module",
        **kwargs
    }


def app_shell_template(variant_name: str, **overrides) -> Dict[str, Any]:
    """Template for app shell variations"""
    return {
        "name": variant_name,
        "variants": [variant_name],
        "build_from": "portal-app-shell/dist/{variant}",
        "deploy_to": "go/portal-{variant}/build",
        "repo_target": "portal-plugin-{variant}",
        "content_type": "ui_application",
        **overrides
    }


def plugin_template(plugin_name: str, **overrides) -> Dict[str, Any]:
    """Template for plugin configurations"""
    return {
        "name": plugin_name,
        "build_from": f"libs/portal-plugin-{plugin_name}/dist",
        "deploy_to": f"go/portal-plugin-{plugin_name}/build",
        "repo_target": f"portal-plugin-{plugin_name}",
        "content_type": "plugin_module",
        **overrides
    }


def discover_plugins() -> Dict[str, Dict[str, Any]]:
    """Auto-discover plugins from filesystem"""
    plugins = {}
    libs_path = Path("libs")
    
    if not libs_path.exists():
        return plugins
    
    for plugin_dir in libs_path.glob("portal-plugin-*"):
        if not plugin_dir.is_dir():
            continue
            
        plugin_name = plugin_dir.name.replace("portal-plugin-", "")
        
        # Check if this is a frontend plugin (has dist with manifest) or library
        dist_path = plugin_dir / "dist"
        is_frontend_plugin = dist_path.exists() and (dist_path / "mf-manifest.json").exists()
        
        # Only include frontend plugins in build registry
        if not is_frontend_plugin:
            continue
            
        # Detect plugin type from structure
        if plugin_name in ["dashboard", "admin"]:
            plugin_type = "feature"
        else:
            plugin_type = "core"
            
        plugins[plugin_name] = plugin_template(plugin_name, type=plugin_type)
    
    return plugins


# ============================================================================
# DSL Configuration
# ============================================================================

def build_registry(config: Dict, validation_rules: Optional[List] = None) -> BuildRegistry:
    """Main DSL entry point"""
    builder = BuildRegistryBuilder(config, validation_rules)
    return builder.build()


class BuildRegistryBuilder:
    def __init__(self, config: Dict, validation_rules: Optional[List] = None):
        self.config = config
        self.validation_rules = validation_rules or []
        self.targets = {}
    
    def build(self) -> BuildRegistry:
        """Build the complete registry"""
        self._build_app_shell_targets()
        self._build_plugin_targets()
        
        self._validate_registry()
        return BuildRegistry(self.targets)
    
    def _build_app_shell_targets(self):
        """Build app shell variation targets"""
        app_shell_config = self.config.get("app_shell", {})
        
        for name, config in app_shell_config.items():
            if config.get("type") == "ui_application":
                target = self._build_ui_app_target(name, config)
                # Use unique name to avoid collision with plugins
                unique_name = f"{name}-app-shell"
                self.targets[unique_name] = target
                
    
    def _build_plugin_targets(self):
        """Build plugin targets"""
        plugins_config = self.config.get("plugins", {})
        
        # Core plugins
        for plugin_name in plugins_config.get("core_plugins", []):
            target = self._build_plugin_target(plugin_name, "core")
            self.targets[plugin_name] = target
        
        # Feature plugins
        feature_plugins = plugins_config.get("feature_plugins", {})
        for plugin_name, config in feature_plugins.items():
            target = self._build_plugin_target(plugin_name, "feature", config)
            self.targets[plugin_name] = target
    
    def _build_ui_app_target(self, name: str, config: Dict) -> BuildTarget:
        """Build UI app target from config"""
        variants = config.get("variants", [name])
        targets = []
        
        for variant in variants:
            source_path = Path(config["build_from"].format(variant=variant))
            target_path = Path(config["deploy_to"].format(variant=variant))
            repo_target = config["repo_target"].format(variant=variant)
            
            target = BuildTarget(
                name=f"{name}-app",  # Unique name to avoid collision
                context=BuildContext(BuildContextType.APP_SHELL, "ui", variant),
                source_path=source_path,
                target_path=target_path,
                repo_target=repo_target,
                content_type=ContentType.UI_APPLICATION,
                variants=variants
            )
            targets.append(target)
        
        # Return first target as primary, store others as variants
        return targets[0]
    
    def _build_plugin_target(self, plugin_name: str, plugin_type: str, config: Optional[Dict] = None) -> BuildTarget:
        """Build plugin target from name and type"""
        if config is None:
            config = plugin_template(plugin_name, type=plugin_type)
        
        return BuildTarget(
            name=plugin_name,
            context=BuildContext(BuildContextType.PLUGIN, plugin_type, plugin_name),
            source_path=Path(config["build_from"]),
            target_path=Path(config["deploy_to"]),
            repo_target=config["repo_target"],
            content_type=ContentType[config["content_type"].upper()],
            dependencies=config.get("dependencies", []),
            exposes=config.get("exposes", [])
        )
    
    def _validate_registry(self):
        """Validate the complete registry"""
        # Setup merge partnerships
        self._setup_merge_partnerships()
        
        validator = RegistryValidator(self.validation_rules)
        validator.validate(list(self.targets.values()))
    
    def _setup_merge_partnerships(self):
        """Setup merge partnerships for targets that share repo destinations"""
        # Group targets by repo_target
        repo_groups = {}
        for name, target in self.targets.items():
            repo_target = target.repo_target
            if repo_target not in repo_groups:
                repo_groups[repo_target] = []
            repo_groups[repo_target].append((name, target))
        
        # Setup merge partnerships for groups with multiple targets
        for repo_target, targets in repo_groups.items():
            if len(targets) > 1:
                # All targets in this group should merge
                target_names = [name for name, _ in targets]
                for name, target in targets:
                    target.merge_partners = [n for n in target_names if n != name]


# ============================================================================
# Validation System
# ============================================================================

@dataclass
class ValidationRule:
    name: str
    validator: callable
    error_message: str


class RegistryValidator:
    def __init__(self, rules: List[ValidationRule] = None):
        self.rules = rules or self._default_rules()
    
    def _default_rules(self) -> List[ValidationRule]:
        """Default validation rules"""
        return [
            ValidationRule(
                name="no_target_path_collisions",
                validator=lambda targets: len(set(t.target_path for t in targets)) == len(targets),
                error_message="Target path collision detected"
            ),
            ValidationRule(
                name="no_repo_target_collisions", 
                validator=self._no_invalid_repo_collisions,
                error_message="Repository target collision detected"
            ),
            ValidationRule(
                name="ui_apps_must_have_index_html",
                validator=self._ui_apps_have_index_html,
                error_message="UI app must have index.html"
            ),
            ValidationRule(
                name="plugins_must_have_manifest_file",
                validator=self._plugins_have_manifest,
                error_message="Plugin must have mf-manifest.json"
            )
        ]
    
    def _ui_apps_have_index_html(self, targets: List[BuildTarget]) -> bool:
        """Check UI apps have index.html"""
        for target in targets:
            if target.content_type == ContentType.UI_APPLICATION:
                # Only validate if source path exists
                if not target.source_path.exists():
                    return True  # Skip validation for non-existent sources (will be handled later)
                if not (target.source_path / "index.html").exists():
                    return False
        return True
    
    def _plugins_have_manifest(self, targets: List[BuildTarget]) -> bool:
        """Check plugins have manifest file"""
        for target in targets:
            if target.content_type == ContentType.PLUGIN_MODULE:
                # Only validate if source path exists
                if not target.source_path.exists():
                    return True  # Skip validation for non-existent sources (will be handled later)
                manifest_path = target.source_path / "mf-manifest.json"
                if not manifest_path.exists():
                    return False
        return True
    
    def _no_invalid_repo_collisions(self, targets: List[BuildTarget]) -> bool:
        """Check for invalid repo collisions (allow merging)"""
        repo_groups = {}
        for target in targets:
            repo_target = target.repo_target
            if repo_target not in repo_groups:
                repo_groups[repo_target] = []
            repo_groups[repo_target].append(target)
        
        # Check each repo group for invalid collisions
        for repo_target, group_targets in repo_groups.items():
            if len(group_targets) <= 1:
                continue  # No collision
            
            # Only allow collisions between app-shell and plugin targets
            context_types = set(t.context.type for t in group_targets)
            if len(context_types) > 2:
                return False  # Too many different context types
            
            # Must have at least one app-shell and one plugin for valid merge
            if BuildContextType.APP_SHELL not in context_types or BuildContextType.PLUGIN not in context_types:
                return False
            
            # Validate that all target paths are different (this is the real collision)
            target_paths = [t.target_path for t in group_targets]
            if len(set(target_paths)) != len(target_paths):
                return False
        
        return True
    
    def validate(self, targets: List[BuildTarget]):
        """Run all validation rules"""
        for rule in self.rules:
            try:
                if not rule.validator(targets):
                    raise ValidationError(f"{rule.name}: {rule.error_message}")
            except Exception as e:
                raise ValidationError(f"Validation failed for {rule.name}: {e}")


class ValidationError(Exception):
    pass


# ============================================================================
# Build System Core
# ============================================================================

class ContextAwareBuilder:
    """Build with context-specific logic"""
    
    def __init__(self, repo_root: Path, verbose: bool = False):
        self.repo_root = repo_root
        self.verbose = verbose
    
    def build_targets(self, targets: List[BuildTarget]) -> None:
        """Build all targets with context isolation"""
        # Group targets by context type
        app_shell_targets = [t for t in targets if t.context.type == BuildContextType.APP_SHELL]
        plugin_targets = [t for t in targets if t.context.type == BuildContextType.PLUGIN]
        
        # Build app shell variations first
        if app_shell_targets:
            self._build_app_shell_targets(app_shell_targets)
        
        # Build plugins next
        if plugin_targets:
            self._build_plugin_targets(plugin_targets)
    
    def _build_app_shell_targets(self, targets: List[BuildTarget]) -> None:
        """Build app shell variations"""
        if self.verbose:
            logger.info(f"Building {len(targets)} app shell targets")
        
        # Run turbo build for app shell
        cmd = ["pnpm", "run", "build", "--filter=portal-app-shell"]
        self._run_command(cmd)
    
    def _build_plugin_targets(self, targets: List[BuildTarget]) -> None:
        """Build plugins"""
        if self.verbose:
            logger.info(f"Building {len(targets)} plugin targets")
        
        plugin_names = [t.name for t in targets]
        cmd = ["pnpm", "run", "build", f"--filter={','.join(f'portal-plugin-{name}' for name in plugin_names)}"]
        self._run_command(cmd)
    
    def _run_command(self, cmd: List[str]) -> None:
        """Run shell command with error handling"""
        if self.verbose:
            logger.debug(f"Running: {' '.join(cmd)}")
        
        result = subprocess.run(
            cmd,
            cwd=self.repo_root,
            capture_output=True,
            text=True
        )
        
        if result.returncode != 0:
            raise RuntimeError(f"Command failed: {' '.join(cmd)}\n{result.stderr}")


class SafeBuildCopier:
    """Copy builds with collision prevention"""
    
    def __init__(self, repo_root: Path, verbose: bool = False):
        self.repo_root = repo_root
        self.verbose = verbose
        self.copied_repos = set()  # Track which repos have been copied
    
    def copy_targets(self, targets: List[BuildTarget]) -> None:
        """Copy all targets safely with merge support"""
        # Group targets by repo_target for merging
        repo_groups = {}
        for target in targets:
            repo_target = target.repo_target
            if repo_target not in repo_groups:
                repo_groups[repo_target] = []
            repo_groups[repo_target].append(target)
        
        # Copy each repo group (merged if multiple targets)
        for repo_target, group_targets in repo_groups.items():
            self._copy_repo_group(repo_target, group_targets)
    
    def _copy_repo_group(self, repo_target: str, targets: List[BuildTarget]) -> None:
        """Copy a group of targets that merge to the same repo"""
        if repo_target in self.copied_repos:
            return  # Already copied this repo
        
        if self.verbose:
            if len(targets) > 1:
                logger.info(f"Merging {len(targets)} targets to {repo_target}")
                for target in targets:
                    logger.debug(f"  {target.name} ({target.context.type.value})")
            else:
                logger.info(f"Copying single target {targets[0].name} to {repo_target}")
        
        # Merge all targets to same destination
        for target in targets:
            self._copy_merge_target(target)
        
        self.copied_repos.add(repo_target)
    
    def _copy_merge_target(self, target: BuildTarget) -> None:
        """Copy target with merge support"""
        if not target.source_path.exists():
            logger.warning(f"Source path does not exist: {target.source_path}")
            return
        
        target_dir = self.repo_root / target.target_path
        if self.verbose:
            logger.debug(f"Copying {target.name} to {target.target_path}")
        
        # For merge targets, don't remove existing directory - merge into it
        if not target_dir.exists():
            target_dir.mkdir(parents=True, exist_ok=True)
        
        # Copy files (merge mode - don't overwrite existing files)
        for item in target.source_path.iterdir():
            dest_path = target_dir / item.name
            
            if item.is_dir():
                if not dest_path.exists():
                    shutil.copytree(item, dest_path)
                else:
                    # Merge directory contents
                    for subitem in item.iterdir():
                        shutil.copy2(subitem, dest_path / subitem.name)
            else:
                # Don't overwrite existing files in merge mode
                if not dest_path.exists():
                    shutil.copy2(item, dest_path)
        
        # Remove .vite directories
        vite_dir = target_dir / ".vite"
        if vite_dir.exists():
            shutil.rmtree(vite_dir)
            if self.verbose:
                logger.debug(f"  Removed .vite directory from {target.name}")


# ============================================================================
# Main Application
# ============================================================================

def setup_logging(verbose: bool = False) -> logging.Logger:
    """Configure logging for the script"""
    level = logging.DEBUG if verbose else logging.INFO
    logging.basicConfig(
        level=level,
        format='%(asctime)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    return logging.getLogger(__name__)


logger = logging.getLogger(__name__)


def create_default_registry() -> BuildRegistry:
    """Create default build registry"""
    config = create_default_config()
    return build_registry(config)


def create_default_config() -> Dict[str, Any]:
    """Create default configuration with helper functions"""
    return {
        "app_shell": create_app_shell_config(),
        "plugins": create_plugins_config()
    }


def create_app_shell_config() -> Dict[str, Any]:
    """Create app shell configuration"""
    return {
        "dashboard": ui_app(**app_shell_template("dashboard")),
        "admin": ui_app(**app_shell_template("admin"))
    }


def create_plugins_config() -> Dict[str, Any]:
    """Create plugins configuration"""
    return {
        "core_plugins": get_core_plugins(),
        "feature_plugins": discover_plugins()
    }


def get_core_plugins() -> List[str]:
    """Get list of core plugins that should always be built"""
    return ["ipfs", "core", "lbry"]


def get_app_shell_variants() -> List[str]:
    """Get list of app shell variations"""
    return ["dashboard", "admin"]


def create_app_shell_variant_config(variant_name: str) -> Dict[str, Any]:
    """Create configuration for a specific app shell variant"""
    return ui_app(**app_shell_template(variant_name))


# Functional helpers for building config elements

def build_app_shell_section(variants: List[str] = None) -> Dict[str, Any]:
    """Build app shell configuration section"""
    variants = variants or get_app_shell_variants()
    return {variant: create_app_shell_variant_config(variant) for variant in variants}


def build_plugins_section(
    core_plugin_names: List[str] = None,
    include_feature_plugins: bool = True,
    custom_plugins: Dict[str, Dict] = None
) -> Dict[str, Any]:
    """Build plugins configuration section"""
    return {
        "core_plugins": core_plugin_names or get_core_plugins(),
        "feature_plugins": {
            **(discover_plugins() if include_feature_plugins else {}),
            **(custom_plugins or {})
        }
    }


def build_config(
    app_shell_variants: List[str] = None,
    core_plugins: List[str] = None,
    include_feature_plugins: bool = True,
    custom_plugins: Dict[str, Dict] = None
) -> Dict[str, Any]:
    """Build complete configuration from functional elements"""
    return {
        "app_shell": build_app_shell_section(app_shell_variants),
        "plugins": build_plugins_section(core_plugins, include_feature_plugins, custom_plugins)
    }


def create_default_config() -> Dict[str, Any]:
    """Create default configuration using functional builders"""
    return build_config()


def create_plugins_only_config() -> Dict[str, Any]:
    """Create configuration with only plugins (no app shell)"""
    return {
        "app_shell": {},
        "plugins": create_plugins_config()
    }


def create_app_shell_only_config() -> Dict[str, Any]:
    """Create configuration with only app shell (no plugins)"""
    return {
        "app_shell": create_app_shell_config(),
        "plugins": {
            "core_plugins": [],
            "feature_plugins": {}
        }
    }


def create_minimal_config() -> Dict[str, Any]:
    """Create minimal configuration - no app shell, only core plugins"""
    return {
        "app_shell": {},
        "plugins": {
            "core_plugins": get_core_plugins(),
            "feature_plugins": {}
        }
    }





def parse_arguments() -> argparse.Namespace:
    """Parse command line arguments"""
    parser = argparse.ArgumentParser(
        description="Build and release portal apps and plugins to Go modules",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Build all apps and plugins (default)
  python scripts/release-go-dsl.py

  # Build specific targets
  python scripts/release-go-dsl.py --targets dashboard,ipfs

  # Build with verbose output
  python scripts/release-go-dsl.py --verbose
        """
    )
    
    parser.add_argument(
        "--targets",
        help="Specific targets to build (CSV format)",
        default="all"
    )
    
    parser.add_argument(
        "--verbose", "-v",
        help="Enable verbose logging",
        action="store_true"
    )
    
    parser.add_argument(
        "--dry-run",
        help="Show what would be built without actually building",
        action="store_true"
    )
    
    parser.add_argument(
        "--validate-only",
        help="Only validate configuration without building",
        action="store_true"
    )
    
    parser.add_argument(
        "--force",
        help="Force release even if no git changes detected",
        action="store_true"
    )
    
    parser.add_argument(
        "--no-push",
        help="Create commit but do not push to remote",
        action="store_true"
    )
    
    return parser.parse_args()


def filter_targets(registry: BuildRegistry, target_filter: str) -> List[BuildTarget]:
    """Filter targets based on command line arguments"""
    if target_filter == "all":
        return list(registry.targets.values())
    
    requested_targets = [t.strip() for t in target_filter.split(",")]
    filtered_targets = []
    
    for target_name in requested_targets:
        if target_name in registry.targets:
            filtered_targets.append(registry.targets[target_name])
        else:
            logger.warning(f"Target not found: {target_name}")
    
    return filtered_targets


def main():
    """Main entry point"""
    args = parse_arguments()
    logger = setup_logging(args.verbose)
    
    try:
        # Create build registry
        registry = create_default_registry()
        
        # Filter targets
        targets = filter_targets(registry, args.targets)
        
        if not targets:
            logger.error("No valid targets to build")
            return 1
        
        # Show build plan
        logger.info(f"Build plan: {len(targets)} targets")
        for target in targets:
            logger.info(f"  {target.name} ({target.context.type.value}) -> {target.target_path}")
        
        if args.validate_only:
            logger.info("Validation complete")
            return 0
        
        if args.dry_run:
            logger.info("Dry run complete")
            return 0
        
        # Get repository root
        repo_root = Path.cwd()
        
        # Check for force flag vs actual changes
        if not args.force:
            # Check if there are actual git changes that would affect the build
            diff_result = subprocess.run(
                ["git", "diff", "HEAD~1", "HEAD", "--name-only", "apps/", "libs/"],
                cwd=repo_root,
                capture_output=True,
                text=True
            )
            
            if diff_result.returncode == 0 and not diff_result.stdout.strip():
                logger.info("No git changes detected, skipping build (use --force to override)")
                return 0
        
        # Build targets
        builder = ContextAwareBuilder(repo_root, args.verbose)
        builder.build_targets(targets)
        
        # Copy to Go directories
        copier = SafeBuildCopier(repo_root, args.verbose)
        copier.copy_targets(targets)
        
        # Git operations
        if not args.no_push:
            # Stage and commit changes
            import subprocess
            result = subprocess.run(
                ["git", "add", "go/"],
                cwd=repo_root,
                capture_output=True,
                text=True
            )
            
            if result.returncode != 0:
                logger.error(f"Failed to stage changes: {result.stderr}")
                return 1
            
            # Check if there are changes to commit
            status_result = subprocess.run(
                ["git", "status", "--porcelain", "go/"],
                cwd=repo_root,
                capture_output=True,
                text=True
            )
            
            if status_result.returncode == 0 and status_result.stdout.strip():
                logger.info("Changes detected, committing...")
                commit_result = subprocess.run(
                    ["git", "commit", "-m", "chore: export app and plugin builds"],
                    cwd=repo_root,
                    capture_output=True,
                    text=True
                )
                
                if commit_result.returncode != 0:
                    logger.error(f"Failed to commit changes: {commit_result.stderr}")
                    return 1
                
                # Push changes
                push_result = subprocess.run(
                    ["git", "push"],
                    cwd=repo_root,
                    capture_output=True,
                    text=True
                )
                
                if push_result.returncode != 0:
                    logger.error(f"Failed to push changes: {push_result.stderr}")
                    return 1
                
                logger.info("Changes pushed successfully")
            else:
                logger.info("No changes to commit")
        else:
            logger.info("Skipping git operations (no-push specified)")
        
        logger.info("Build and copy completed successfully")
        return 0
        
    except Exception as e:
        logger.error(f"Build failed: {e}")
        if args.verbose:
            logger.debug(traceback.format_exc())
        return 1


if __name__ == "__main__":
    sys.exit(main())