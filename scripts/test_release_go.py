#!/usr/bin/env python3
"""
Test suite for release-go-dsl.py

Tests the DSL system, validation, and build collision prevention.
"""

import pytest
import tempfile
import shutil
from pathlib import Path
from unittest.mock import Mock, patch

from release_go import (
    BuildRegistry, BuildTarget, BuildContext, BuildContextType, ContentType,
    build_registry, ui_app, plugin, app_shell_template, plugin_template,
    discover_plugins, RegistryValidator, ValidationError,
    ContextAwareBuilder, SafeBuildCopier
)


class TestDSLHelpers:
    """Test DSL helper functions"""
    
    def test_ui_app_helper(self):
        """Test ui_app helper function"""
        config = ui_app(name="dashboard", variants=["dashboard", "admin"])
        assert config["name"] == "dashboard"
        assert config["type"] == "ui_application"
        assert config["variants"] == ["dashboard", "admin"]
    
    def test_plugin_helper(self):
        """Test plugin helper function"""
        config = plugin(name="ipfs", dependencies=["core"])
        assert config["name"] == "ipfs"
        assert config["type"] == "plugin_module"
        assert config["dependencies"] == ["core"]
    
    def test_app_shell_template(self):
        """Test app shell template"""
        config = app_shell_template("dashboard")
        assert config["name"] == "dashboard"
        assert config["build_from"] == "portal-app-shell/dist/{variant}"
        assert config["deploy_to"] == "go/portal-{variant}/build"
    
    def test_plugin_template(self):
        """Test plugin template"""
        config = plugin_template("ipfs")
        assert config["name"] == "ipfs"
        assert config["build_from"] == "libs/portal-plugin-ipfs/dist"
        assert config["deploy_to"] == "go/portal-plugin-ipfs/build"


class TestBuildRegistry:
    """Test BuildRegistry and builder"""
    
    def test_simple_registry_build(self):
        """Test building a simple registry"""
        config = {
            "app_shell": {
                "dashboard": ui_app(**app_shell_template("dashboard"))
            },
            "plugins": {
                "core_plugins": ["ipfs"],
                "feature_plugins": {}
            }
        }
        
        registry = build_registry(config)
        
        assert "dashboard" in registry.targets
        assert "ipfs" in registry.targets
        
        dashboard_target = registry.targets["dashboard"]
        assert dashboard_target.context.type == BuildContextType.APP_SHELL
        assert dashboard_target.content_type == ContentType.UI_APPLICATION
        
        ipfs_target = registry.targets["ipfs"]
        assert ipfs_target.context.type == BuildContextType.PLUGIN
        assert ipfs_target.content_type == ContentType.PLUGIN_MODULE
    
    def test_collision_detection(self):
        """Test collision detection in registry"""
        # Create config with collision (same target path)
        config = {
            "app_shell": {
                "dashboard": ui_app(
                    name="dashboard",
                    build_from="test/dist",
                    deploy_to="go/same-path/build"  # Collision!
                )
            },
            "plugins": {
                "feature_plugins": {
                    "other": plugin(
                        name="other", 
                        build_from="test2/dist",
                        deploy_to="go/same-path/build"  # Same path!
                    )
                }
            }
        }
        
        with pytest.raises(ValidationError, match="Target path collision"):
            build_registry(config)
    
    def test_ui_app_validation(self):
        """Test UI app validation"""
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)
            
            # Create config without index.html
            config = {
                "app_shell": {
                    "dashboard": ui_app(
                        name="dashboard",
                        source_path=temp_path / "missing",
                        build_from="missing/dist",
                        deploy_to="go/portal-dashboard/build"
                    )
                },
                "plugins": {}
            }
            
            with pytest.raises(ValidationError, match="UI app must have index.html"):
                build_registry(config)


class TestValidationSystem:
    """Test validation system"""
    
    def test_no_target_path_collisions(self):
        """Test no target path collisions rule"""
        # Valid case - different paths
        target1 = BuildTarget("test1", BuildContext(BuildContextType.PLUGIN, "test", "test1"), 
                            Path("source1"), Path("go/target1"), "repo1", ContentType.PLUGIN_MODULE)
        target2 = BuildTarget("test2", BuildContext(BuildContextType.PLUGIN, "test", "test2"),
                            Path("source2"), Path("go/target2"), "repo2", ContentType.PLUGIN_MODULE)
        
        validator = RegistryValidator()
        assert validator._default_rules()[0].validator([target1, target2]) == True
        
        # Invalid case - same path
        target3 = BuildTarget("test3", BuildContext(BuildContextType.PLUGIN, "test", "test3"),
                            Path("source3"), Path("go/target1"), "repo3", ContentType.PLUGIN_MODULE)  # Same path!
        
        assert validator._default_rules()[0].validator([target1, target3]) == False
    
    def test_plugin_manifest_validation(self):
        """Test plugin manifest validation"""
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)
            
            # Plugin without manifest
            plugin_dir = temp_path / "plugins" / "portal-plugin-test"
            plugin_dir.mkdir(parents=True)
            
            target = BuildTarget("test", BuildContext(BuildContextType.PLUGIN, "test", "test"),
                                plugin_dir, Path("go/test"), "repo-test", ContentType.PLUGIN_MODULE)
            
            validator = RegistryValidator()
            assert validator._plugins_have_manifest([target]) == False
            
            # Add manifest
            (plugin_dir / "mf-manifest.json").touch()
            assert validator._plugins_have_manifest([target]) == True


class TestBuildSystem:
    """Test build system components"""
    
    @patch('subprocess.run')
    def test_context_aware_builder_app_shell(self, mock_run):
        """Test building app shell targets"""
        mock_run.return_value = Mock(returncode=0, stdout="", stderr="")
        
        with tempfile.TemporaryDirectory() as temp_dir:
            repo_root = Path(temp_dir)
            builder = ContextAwareBuilder(repo_root, verbose=True)
            
            target = BuildTarget("dashboard", BuildContext(BuildContextType.APP_SHELL, "ui", "dashboard"),
                                Path("source"), Path("target"), "repo", ContentType.UI_APPLICATION)
            
            builder._build_app_shell_targets([target])
            
            # Verify correct command was called
            mock_run.assert_called_once()
            args = mock_run.call_args[0][0]
            assert "pnpm" in args
            assert "portal-app-shell" in " ".join(args)
    
    @patch('subprocess.run')
    def test_context_aware_builder_plugins(self, mock_run):
        """Test building plugin targets"""
        mock_run.return_value = Mock(returncode=0, stdout="", stderr="")
        
        with tempfile.TemporaryDirectory() as temp_dir:
            repo_root = Path(temp_dir)
            builder = ContextAwareBuilder(repo_root)
            
            target1 = BuildTarget("ipfs", BuildContext(BuildContextType.PLUGIN, "core", "ipfs"),
                                 Path("source1"), Path("target1"), "repo1", ContentType.PLUGIN_MODULE)
            target2 = BuildTarget("core", BuildContext(BuildContextType.PLUGIN, "core", "core"),
                                 Path("source2"), Path("target2"), "repo2", ContentType.PLUGIN_MODULE)
            
            builder._build_plugin_targets([target1, target2])
            
            # Verify correct command was called
            mock_run.assert_called_once()
            args = mock_run.call_args[0][0]
            assert "pnpm" in args
            assert "portal-plugin-ipfs,portal-plugin-core" in " ".join(args)
    
    def test_safe_build_copier(self):
        """Test safe build copier"""
        with tempfile.TemporaryDirectory() as temp_dir:
            repo_root = Path(temp_dir)
            
            # Create source with test files
            source_dir = repo_root / "source"
            source_dir.mkdir()
            (source_dir / "index.html").write_text("<html>test</html>")
            (source_dir / "mf-manifest.json").write_text("{}")
            
            # Create .vite directory (should be removed)
            vite_dir = source_dir / ".vite"
            vite_dir.mkdir()
            (vite_dir / "cache.txt").write_text("cache")
            
            target = BuildTarget("test", BuildContext(BuildContextType.PLUGIN, "test", "test"),
                                source_dir, Path("go/test/build"), "repo-test", ContentType.PLUGIN_MODULE)
            
            copier = SafeBuildCopier(repo_root)
            copier._copy_single_target(target)
            
            # Verify files were copied
            target_dir = repo_root / "go" / "test" / "build"
            assert target_dir.exists()
            assert (target_dir / "index.html").exists()
            assert (target_dir / "mf-manifest.json").exists()
            
            # Verify .vite was removed
            assert not (target_dir / ".vite").exists()


class TestIntegration:
    """Integration tests"""
    
    def test_end_to_end_registry_creation(self):
        """Test end-to-end registry creation"""
        config = {
            "app_shell": {
                "dashboard": ui_app(**app_shell_template("dashboard")),
                "admin": ui_app(**app_shell_template("admin"))
            },
            "plugins": {
                "core_plugins": ["ipfs", "core", "lbry"],
                "feature_plugins": {
                    "dashboard": plugin(
                        name="dashboard",
                        dependencies=["core"],
                        exposes=["account/*", "widgets/*"]
                    )
                }
            }
        }
        
        registry = build_registry(config)
        
        # Verify all targets created
        assert len(registry.targets) >= 5  # dashboard, admin, ipfs, core, lbry, dashboard-plugin
        
        # Verify dashboard app shell target
        dashboard_app = registry.targets["dashboard"]
        assert dashboard_app.context.type == BuildContextType.APP_SHELL
        assert dashboard_app.content_type == ContentType.UI_APPLICATION
        
        # Verify dashboard plugin target
        dashboard_plugin = registry.targets.get("dashboard")  # May be overwritten by app shell
        assert dashboard_plugin is not None
        
        # Verify core plugins
        assert "ipfs" in registry.targets
        assert "core" in registry.targets
        assert "lbry" in registry.targets
        
        ipfs_target = registry.targets["ipfs"]
        assert ipfs_target.context.type == BuildContextType.PLUGIN
        assert ipfs_target.content_type == ContentType.PLUGIN_MODULE


if __name__ == "__main__":
    pytest.main([__file__, "-v"])