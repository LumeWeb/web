#!/usr/bin/env python3
"""
pnpm-catalog-manager - A tool for managing pnpm workspace catalogs.

This tool helps maintain synchronized dependency versions across a monorepo by:
1. Analyzing all package.json files to identify shared dependencies
2. Finding the highest version for each shared dependency
3. Updating the pnpm-workspace.yaml catalog
4. Converting dependencies to use catalog references

Usage:
    python scripts/pnpm-catalog-manager.py analyze [--verbose]
    python scripts/pnpm-catalog-manager.py update-catalog
    python scripts/pnpm-catalog-manager.py mass-update
    python scripts/pnpm-catalog-manager.py all [--verbose]
"""

import argparse
import json
import yaml
from pathlib import Path
from typing import Dict, List, Tuple
from packaging import version


# Constants
CATALOG_PROTOCOL = "catalog:"
WORKSPACE_PROTOCOL = "workspace:"

# package.json dependency types
DEPS_DEPENDENCIES = "dependencies"
DEPS_DEV = "devDependencies"
DEPS_PEER = "peerDependencies"
DEPS_TYPES = [DEPS_DEPENDENCIES, DEPS_DEV, DEPS_PEER]

# pnpm-workspace.yaml keys
WORKSPACE_CATALOG = "catalog"
WORKSPACE_PACKAGES = "packages"

# npm version range prefixes
VERSION_PREFIXES = ['^', '~', '>=', '<=', '>', '<', '=', '!']
OR_OPERATOR = "||"

# Output directory
OUTPUT_DIR_NAME = "output"
ANALYSIS_FILE_NAME = "shared-dependencies-analysis.json"


def find_package_json_files(root_dir: str) -> List[Path]:
    """Find all package.json files in the workspace, excluding node_modules."""
    root = Path(root_dir)
    package_files = []
    
    for pkg_file in root.rglob("package.json"):
        if "node_modules" not in pkg_file.parts:
            package_files.append(pkg_file)
    
    return package_files


def parse_version(version_str: str) -> version.Version:
    """Parse a version string, handling various semver formats."""
    cleaned = version_str
    
    # Split on OR operator and take the first option
    if OR_OPERATOR in cleaned:
        cleaned = cleaned.split(OR_OPERATOR)[0].strip()
    
    # Remove npm version range prefixes
    for prefix in VERSION_PREFIXES:
        if cleaned.startswith(prefix):
            cleaned = cleaned[len(prefix):]
            break
    
    cleaned = cleaned.strip()
    
    try:
        return version.parse(cleaned)
    except version.InvalidVersion:
        return version.parse("0.0.0")


def compare_versions(v1: str, v2: str) -> Tuple[str, bool]:
    """Compare two version strings. Returns (higher_version, is_v1_higher)."""
    try:
        parsed_v1 = parse_version(v1)
        parsed_v2 = parse_version(v2)
        
        if parsed_v1 > parsed_v2:
            return v1, True
        elif parsed_v2 > parsed_v1:
            return v2, False
        else:
            return v1, True
    except Exception:
        return v1, True


def load_package_json(file_path: Path) -> Dict:
    """Load and parse a package.json file."""
    try:
        with open(file_path, 'r') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading {file_path}: {e}")
        return {}


def get_all_dependencies(pkg: Dict, catalog: Dict[str, str] = None) -> Dict[str, str]:
    """Get all dependencies from a package.json (deps, devDeps, peerDeps).
    
    If catalog is provided, resolves catalog references to their actual versions.
    """
    all_deps = {}
    
    for dep_type in DEPS_TYPES:
        if dep_type in pkg:
            for dep_name, dep_version in pkg[dep_type].items():
                # Resolve catalog references to actual versions
                if dep_version.startswith(CATALOG_PROTOCOL):
                    catalog_key = dep_version.split(':', 1)[1]
                    if catalog_key == '' or catalog_key == dep_name:
                        # Default catalog reference
                        if catalog and dep_name in catalog:
                            all_deps[dep_name] = catalog[dep_name]
                        else:
                            # Can't resolve, skip this dependency
                            continue
                    elif catalog and catalog_key in catalog:
                        # Named catalog reference
                        all_deps[dep_name] = catalog[catalog_key]
                    else:
                        # Can't resolve, skip this dependency
                        continue
                else:
                    all_deps[dep_name] = dep_version
    
    return all_deps


def analyze_dependencies(package_files: List[Path], root_dir: str, catalog: Dict[str, str] = None) -> Dict:
    """Analyze all package.json files to find shared dependencies.
    
    If catalog is provided, resolves catalog references to their actual versions.
    """
    root = Path(root_dir)
    
    # Track all packages
    all_packages = []
    
    # Map: dependency_name -> list of (package_path, version)
    dependency_map = {}
    
    # Load all packages
    for pkg_file in package_files:
        pkg = load_package_json(pkg_file)
        if not pkg or 'name' not in pkg:
            continue
        
        pkg_name = pkg['name']
        pkg_path = pkg_file.relative_to(root).parent
        all_packages.append(pkg_name)
        
        deps = get_all_dependencies(pkg, catalog)
        for dep_name, dep_version in deps.items():
            if dep_name not in dependency_map:
                dependency_map[dep_name] = []
            dependency_map[dep_name].append((str(pkg_path), dep_version))
    
    # Find shared dependencies (used in 2+ packages)
    shared_dependencies = {
        dep_name: dep_list
        for dep_name, dep_list in dependency_map.items()
        if len(dep_list) >= 2
    }
    
    # Find highest version for each shared dependency
    highest_versions = {}
    for dep_name, dep_list in shared_dependencies.items():
        highest_version = dep_list[0][1]
        for _, dep_version in dep_list[1:]:
            highest_version, _ = compare_versions(highest_version, dep_version)
        highest_versions[dep_name] = highest_version
    
    # Generate catalog suggestions
    catalog_suggestions = {}
    for dep_name, version_str in sorted(highest_versions.items()):
        catalog_suggestions[dep_name] = version_str
    
    return {
        'all_packages': all_packages,
        'dependency_map': dependency_map,
        'shared_dependencies': shared_dependencies,
        'highest_versions': highest_versions,
        'catalog_suggestions': catalog_suggestions
    }


def print_analysis_report(analysis: Dict, verbose: bool = False):
    """Print analysis report."""
    print("=" * 80)
    print("SHARED DEPENDENCIES ANALYSIS REPORT")
    print("=" * 80)
    print()
    
    print(f"Total packages found: {len(analysis['all_packages'])}")
    print(f"Total dependencies: {len(analysis['dependency_map'])}")
    print(f"Shared dependencies (used in 2+ packages): {len(analysis['shared_dependencies'])}")
    print()
    
    if verbose:
        print("=" * 80)
        print("SHARED DEPENDENCIES DETAILS")
        print("=" * 80)
        print()
        
        from collections import defaultdict
        for dep_name in sorted(analysis['shared_dependencies'].keys()):
            dep_list = analysis['shared_dependencies'][dep_name]
            highest = analysis['highest_versions'][dep_name]
            
            print(f"\n{dep_name}")
            print(f"  Highest version: {highest}")
            print(f"  Used in {len(dep_list)} package(s):")
            
            # Group by version
            version_groups = defaultdict(list)
            for pkg_path, dep_version in dep_list:
                version_groups[dep_version].append(pkg_path)
            
            for ver, pkgs in sorted(version_groups.items()):
                marker = " ← HIGHEST" if ver == highest else ""
                print(f"    {ver}{marker}")
                for pkg in sorted(pkgs):
                    print(f"      - {pkg}")
    else:
        print("=" * 80)
        print("SHARED DEPENDENCIES SUMMARY")
        print("=" * 80)
        print()
        print(f"{'Package Name':<50} {'Highest Version':<20} {'Used In'}")
        print("-" * 80)
        
        for dep_name in sorted(analysis['shared_dependencies'].keys()):
            highest = analysis['highest_versions'][dep_name]
            dep_list = analysis['shared_dependencies'][dep_name]
            print(f"{dep_name:<50} {highest:<20} {len(dep_list)} packages")


def save_analysis(analysis: Dict, output_file: str):
    """Save analysis as JSON."""
    with open(output_file, 'w') as f:
        json.dump(analysis, f, indent=2)
    print(f"\nAnalysis saved to: {output_file}")


def get_output_dir() -> Path:
    """Get the output directory path."""
    script_dir = Path(__file__).parent
    output_dir = script_dir / OUTPUT_DIR_NAME
    output_dir.mkdir(exist_ok=True)
    return output_dir


def update_catalog(workspace_file: str, catalog_suggestions: Dict[str, str]):
    """Update the catalog section in pnpm-workspace.yaml."""
    # Load current workspace
    with open(workspace_file, 'r') as f:
        data = yaml.safe_load(f)
    
    # Clear and rebuild catalog
    data[WORKSPACE_CATALOG] = {}
    
    # Update catalog with suggestions, excluding workspace references
    for dep_name, version_str in catalog_suggestions.items():
        if not version_str.startswith(WORKSPACE_PROTOCOL):
            data[WORKSPACE_CATALOG][dep_name] = version_str
    
    # Save updated workspace
    with open(workspace_file, 'w') as f:
        yaml.dump(data, f, default_flow_style=False, sort_keys=False, indent=2)
    
    print(f"Updated: {workspace_file}")


def load_catalog(workspace_file: str) -> Dict[str, str]:
    """Load the catalog from pnpm-workspace.yaml."""
    with open(workspace_file, 'r') as f:
        data = yaml.safe_load(f)
    
    catalog = data.get(WORKSPACE_CATALOG, {})
    
    # Filter out non-string keys
    catalog = {k: v for k, v in catalog.items() if isinstance(k, str) and isinstance(v, str)}
    
    return catalog


def normalize_version(version_str: str) -> str:
    """Normalize a version string for comparison."""
    cleaned = version_str
    
    if OR_OPERATOR in cleaned:
        cleaned = cleaned.split(OR_OPERATOR)[0].strip()
    
    for prefix in VERSION_PREFIXES:
        if cleaned.startswith(prefix):
            cleaned = cleaned[len(prefix):]
            break
    
    cleaned = cleaned.strip()
    
    try:
        return str(version.parse(cleaned))
    except version.InvalidVersion:
        return cleaned


def versions_match(v1: str, v2: str) -> bool:
    """Check if two version strings match after normalization."""
    return normalize_version(v1) == normalize_version(v2)


def update_dependencies(deps: Dict[str, str], catalog: Dict[str, str]) -> Tuple[Dict[str, str], List[Tuple[str, str, str]]]:
    """Update dependencies to use catalog references."""
    from collections import defaultdict
    
    updated = {}
    changes = []
    
    for pkg_name, pkg_version in deps.items():
        # Check if already using catalog reference
        if pkg_version.startswith(CATALOG_PROTOCOL):
            catalog_key = pkg_version.split(':', 1)[1]
            
            if catalog_key == '' or catalog_key == pkg_name:
                if pkg_name in catalog:
                    updated[pkg_name] = pkg_version
                else:
                    print(f"Warning: Package '{pkg_name}' not found in catalog")
                    updated[pkg_name] = pkg_version
            elif catalog_key in catalog:
                updated[pkg_name] = pkg_version
            else:
                print(f"Warning: Invalid catalog reference '{pkg_version}' for package '{pkg_name}'")
                updated[pkg_name] = pkg_version
                changes.append((pkg_name, pkg_version, f"{CATALOG_PROTOCOL} (INVALID)"))
        elif pkg_name in catalog:
            catalog_version = catalog[pkg_name]
            catalog_ref = CATALOG_PROTOCOL
            
            if versions_match(pkg_version, catalog_version):
                updated[pkg_name] = catalog_ref
                changes.append((pkg_name, pkg_version, catalog_ref))
            else:
                updated[pkg_name] = catalog_ref
                changes.append((pkg_name, pkg_version, f"{catalog_ref} (was {pkg_version}, catalog: {catalog_version})"))
        else:
            updated[pkg_name] = pkg_version
    
    return updated, changes


def update_package_file(file_path: Path, catalog: Dict[str, str]) -> Dict:
    """Update a single package.json file to use catalog references."""
    pkg = load_package_json(file_path)
    if not pkg:
        return {'changes': []}
    
    all_changes = []
    
    # Update dependencies
    for dep_type in DEPS_TYPES:
        if dep_type in pkg:
            updated, changes = update_dependencies(pkg[dep_type], catalog)
            pkg[dep_type] = updated
            for change in changes:
                all_changes.append({
                    'type': dep_type,
                    'package': change[0],
                    'old': change[1],
                    'new': change[2]
                })
    
    if not all_changes:
        return {'changes': []}
    
    # Save updated file
    with open(file_path, 'w') as f:
        json.dump(pkg, f, indent=2)
        f.write('\n')
    
    return {'changes': all_changes}


def mass_update_catalog(root_dir: str, workspace_file: str):
    """Mass update all package.json files to use catalog references."""
    # Load catalog
    print(f"Loading catalog from: {workspace_file}")
    catalog = load_catalog(workspace_file)
    print(f"Found {len(catalog)} entries in catalog")
    print()
    
    # Find all package.json files
    package_files = find_package_json_files(root_dir)
    print(f"Found {len(package_files)} package.json files")
    print()
    
    # Update each package.json file
    results = []
    for pkg_file in package_files:
        result = update_package_file(pkg_file, catalog)
        if result['changes']:
            result['file'] = str(pkg_file)
            results.append(result)
    
    # Print summary
    print_summary(results, root_dir)


def print_summary(results: List[Dict], root_dir: str):
    """Print summary of changes."""
    total_files = 0
    total_changes = 0
    
    print("=" * 80)
    print("MASS UPDATE SUMMARY")
    print("=" * 80)
    print()
    
    for result in results:
        if not result['changes']:
            continue
        
        total_files += 1
        file_path = result['file']
        rel_path = Path(file_path).relative_to(root_dir)
        
        print(f"Updated: {rel_path}")
        
        for change in result['changes']:
            total_changes += 1
            print(f"  - {change['type']}: {change['package']}")
            print(f"    {change['old']} → {change['new']}")
        
        print()
    
    print("=" * 80)
    print(f"Total files updated: {total_files}")
    print(f"Total changes made: {total_changes}")
    print("=" * 80)


def cmd_analyze(args):
    """Analyze dependencies."""
    script_dir = Path(__file__).parent
    root_dir = script_dir.parent
    workspace_file = root_dir / "pnpm-workspace.yaml"
    
    # Load existing catalog to resolve catalog references
    catalog = None
    if workspace_file.exists():
        try:
            catalog = load_catalog(str(workspace_file))
            print(f"Loaded existing catalog with {len(catalog)} entries")
        except Exception as e:
            print(f"Warning: Could not load existing catalog: {e}")
    
    print(f"Analyzing packages in: {root_dir}")
    print()
    
    package_files = find_package_json_files(root_dir)
    print(f"Found {len(package_files)} package.json files")
    print()
    
    analysis = analyze_dependencies(package_files, root_dir, catalog)
    print_analysis_report(analysis, verbose=args.verbose)
    
    # Save analysis
    output_dir = get_output_dir()
    output_file = output_dir / ANALYSIS_FILE_NAME
    save_analysis(analysis, str(output_file))


def cmd_update_catalog(args):
    """Update pnpm catalog."""
    script_dir = Path(__file__).parent
    root_dir = script_dir.parent
    workspace_file = root_dir / "pnpm-workspace.yaml"
    output_dir = get_output_dir()
    analysis_file = output_dir / ANALYSIS_FILE_NAME
    
    if not analysis_file.exists():
        print(f"Error: Analysis file not found: {analysis_file}")
        print("Please run 'analyze' first to generate the analysis.")
        return
    
    with open(analysis_file, 'r') as f:
        analysis = json.load(f)
    
    catalog_suggestions = analysis['catalog_suggestions']
    
    print(f"Found {len(catalog_suggestions)} catalog entries to update")
    print()
    
    print("Preview of catalog updates:")
    print("-" * 80)
    for dep_name, version_str in sorted(catalog_suggestions.items())[:10]:
        print(f"  {dep_name}: {version_str}")
    if len(catalog_suggestions) > 10:
        print(f"  ... and {len(catalog_suggestions) - 10} more")
    print("-" * 80)
    print()
    
    update_catalog(str(workspace_file), catalog_suggestions)
    
    print()
    print("=" * 80)
    print("CATALOG UPDATE COMPLETE")
    print("=" * 80)


def cmd_mass_update(args):
    """Mass update all packages to use catalog."""
    script_dir = Path(__file__).parent
    root_dir = script_dir.parent
    workspace_file = root_dir / "pnpm-workspace.yaml"
    
    mass_update_catalog(str(root_dir), str(workspace_file))
    
    print()
    print("=" * 80)
    print("MASS UPDATE COMPLETE")
    print("=" * 80)
    print()
    print("Next steps:")
    print("1. Run: pnpm install to sync dependencies")
    print("2. Run: pnpm build to verify everything works")


def cmd_all(args):
    """Run all commands in sequence."""
    print("Running full catalog management workflow...\n")
    
    # Analyze
    print("Step 1: Analyzing dependencies")
    print("-" * 80)
    cmd_analyze(args)
    print()
    
    # Update catalog
    print("\nStep 2: Updating catalog")
    print("-" * 80)
    cmd_update_catalog(args)
    print()
    
    # Mass update
    print("\nStep 3: Mass updating packages")
    print("-" * 80)
    cmd_mass_update(args)
    
    print()
    print("=" * 80)
    print("WORKFLOW COMPLETE")
    print("=" * 80)
    print()
    print("Next steps:")
    print("1. Run: pnpm install to sync dependencies")
    print("2. Run: pnpm build to verify everything works")


def main():
    parser = argparse.ArgumentParser(
        description='pnpm-catalog-manager - Manage pnpm workspace catalogs',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s analyze              Analyze dependencies
  %(prog)s analyze -v           Analyze with verbose output
  %(prog)s update-catalog       Update pnpm-workspace.yaml catalog
  %(prog)s mass-update          Update all package.json files
  %(prog)s all                  Run all commands in sequence
        """
    )
    
    subparsers = parser.add_subparsers(dest='command', help='Available commands')
    
    # Analyze command
    analyze_parser = subparsers.add_parser('analyze', help='Analyze dependencies')
    analyze_parser.add_argument('-v', '--verbose', action='store_true', help='Show detailed output')
    
    # Update catalog command
    subparsers.add_parser('update-catalog', help='Update pnpm-workspace.yaml catalog')
    
    # Mass update command
    subparsers.add_parser('mass-update', help='Update all package.json files')
    
    # All command
    all_parser = subparsers.add_parser('all', help='Run all commands in sequence')
    all_parser.add_argument('-v', '--verbose', action='store_true', help='Show detailed output')
    
    args = parser.parse_args()
    
    if args.command is None:
        parser.print_help()
        return
    
    if args.command == 'analyze':
        cmd_analyze(args)
    elif args.command == 'update-catalog':
        cmd_update_catalog(args)
    elif args.command == 'mass-update':
        cmd_mass_update(args)
    elif args.command == 'all':
        cmd_all(args)


if __name__ == "__main__":
    main()
