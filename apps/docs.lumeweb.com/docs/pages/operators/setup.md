---
title: Portal Setup
---

# Setting Up Your Portal

## Prerequisites

### System Requirements
- Linux (Ubuntu 22.04 LTS recommended)
- Go 1.23+
- Git
- Build tools (gcc, make)
- Domain name pointed to your server (if using SSL/TLS)
- Port 80/443 accessible (if using SSL/TLS, or custom port if configured)

### System Preparation
```bash
# Install required system packages
sudo apt update
sudo apt install -y build-essential git curl
```

### Optional: SSL/TLS Setup with Caddy
If you need HTTPS support, we recommend using Caddy:
```bash
# Install Caddy
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy
```

## Installation

### 1. Install xportal Tool
```bash
GOPROXY=direct go install go.lumeweb.com/xportal/cmd/xportal@latest
```

### 2. Build Portal with Core Plugins
```bash
xportal build \
  --with go.lumeweb.com/portal-plugin-dashboard@latest \
  --with go.lumeweb.com/portal-plugin-frontend@latest \
  --with go.lumeweb.com/portal-plugin-ipfs@latest
```

## Configuration

The portal requires configuration in `/etc/lumeweb/portal/core.yaml`. Below are all required settings and their defaults where applicable.

### Core Configuration
```yaml
# Required Basic Settings (no defaults)
domain: "your-domain.com"    # Your portal's domain
portal_name: "My Portal"     # Display name for your portal
port: 8080                   # Port to listen on (can be customized)

# Database Configuration
db:
  # Defaults to sqlite with these settings:
  type: "sqlite"             
  file: "portal.db"          
  
  # If using MySQL, all these are required:
  # type: "mysql"
  # host: "localhost"        # Defaults to localhost
  # port: 3306              # Defaults to 3306
  # username: "portal"      # Required, no default
  # password: "password"    # Required, no default
  # name: "portal"          # Defaults to "portal"
  
  cache:
    mode: "memory"          # Defaults to "memory"

# Mail Configuration (all required, minimal defaults)
mail:
  host: "smtp.example.com"   
  port: 25                   # Defaults to 25
  ssl: false                 # Defaults to false
  auth_type: "plain"         # Defaults to "plain"
  username: "portal@example.com"  
  password: "yourpassword"   
  from: "portal@example.com" 

# Storage Configuration
storage:
  s3:
    buffer_bucket: "your-bucket"  # Required, no default
    endpoint: "s3.example.com"    # Required, no default
    region: "us-east-1"          # Required, no default
    access_key: "your-access-key" # Required, no default
    secret_key: "your-secret-key" # Required, no default
  
  sia:
    key: "your-sia-key"          # Required, no default
    cluster: false               # Defaults to false
    url: ""                      # Required only if cluster: true

# System Settings
log:
  level: "info"              # Defaults to "info"

account:
  deletion_grace_period: 48  # Defaults to 48 hours (24 * 2)

cron:
  enabled: true             # Defaults to true
  queue_limit: 50           # Defaults to 50

post_upload_limit: 104857600  # Defaults to 100MB
```

### Plugin Configuration

The portal will automatically create plugin configuration directories under `/etc/lumeweb/portal/plugins.d/`. Each plugin may have its own configuration requirements - see plugin-specific documentation for details.

## Running the Portal

### Service Setup

1. Create `/etc/systemd/system/portal.service`:
```ini
[Unit]
Description=Lume Portal
After=network.target

[Service]
Type=simple
User=portal
ExecStart=/usr/local/bin/portal
Restart=always

[Install]
WantedBy=multi-user.target
```

2. Start the portal service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable portal
sudo systemctl start portal
```

3. Optional: If using Caddy for SSL/TLS, create `/etc/caddy/Caddyfile`:
```
your-domain.com {
    reverse_proxy localhost:8080
}
*.your-domain.com {
    reverse_proxy localhost:8080
}
```

Note: Caddy only supports DNS-based ACME challenges for wildcard certificates. See [Caddy's automatic HTTPS documentation](https://caddyserver.com/docs/automatic-https) for configuring DNS providers.

Then start Caddy:
```bash
sudo systemctl enable caddy
sudo systemctl start caddy
```

## Verification

### Health Checks
1. Verify the service is running:
   ```bash
   sudo systemctl status portal
   ```

2. Check logs for errors:
   ```bash
   sudo journalctl -u portal
   ```

3. Test web access:
   - Main portal: `https://your-domain.com` (through Caddy)
   - Dashboard: `https://account.your-domain.com` (through Caddy)
   - Direct portal access: `http://localhost:8080` (without Caddy)

### Common Issues

1. **Configuration Errors**
   - Check all required fields are set
   - Verify file permissions
   - Review logs for specific error messages

2. **Network Issues**
   - Verify port 80 is accessible for Caddy
   - Verify portal port (default 8080) is accessible locally
   - Check domain DNS settings
   - Confirm firewall rules

3. **Database Issues**
   - Verify database connection settings
   - Check database user permissions
   - Ensure storage paths are writable

## Next Steps

1. Configure additional plugins as needed
2. Set up monitoring and backups
3. Review security settings
4. Verify Caddy SSL certificate auto-provisioning

For additional help:
- Join our community channels
- Review plugin-specific documentation
