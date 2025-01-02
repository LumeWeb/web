---
title: Operating a Portal
---

# Operating a Portal

## Introduction

Running a Lume Portal means providing gateway access to decentralized networks. You can run a portal for:
- Private use within your organization
- Public access as a community service
- Development and testing

Each portal contributes to the broader network of decentralized access points.

## Base Requirements

### Software
- Linux (Ubuntu 22.04 LTS recommended)
- Go 1.23+
- Docker (optional but recommended)

### Network
- Public IP address
- Port 443 for HTTPS access
- Additional ports opened based on enabled plugins (documented per plugin)

### Hardware
- 4 CPU cores
- 8GB RAM
- 20GB SSD storage for base system

### Database
- SQLite by default (good for most deployments)
- MySQL/PostgreSQL optional for larger deployments

The portal is designed to start small and scale up. You can begin with these base requirements and expand resources as your needs grow.

## Plugin Considerations 

Each plugin has different resource needs. We recommend starting with 1-2 plugins and monitoring resource usage before enabling more.

## Planning Your Deployment

Before setting up your portal:

1. **Choose Your Plugins**
   - Decide which protocols to support
   - Review each plugin's requirements
   - Plan for resource needs

2. **Consider Your Users**
   - Private or public access
   - Expected usage patterns
   - Access controls needed

3. **Basic Security**
   - Network security
   - Access management
   - Update procedures

Ready to install? Continue to our [Setup Guide](/operators/setup).
