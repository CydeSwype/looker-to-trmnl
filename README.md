# Looker to TRMNL Data Pipeline

Automated pipeline to deliver Looker reports to TRMNL e-ink displays via scheduled email delivery.

## Project Structure

```
.
├── trmnl-plugin/          # TRMNL plugin code
├── pipedream-workflow/    # Pipedream workflow code
├── scripts/               # Setup and utility scripts
├── config/                # Configuration templates
└── docs/                  # Additional documentation
```

## Quick Start

### Prerequisites

1. **TRMNL Account**: Sign up at [trmnl.co](https://trmnl.co)
2. **G Suite Account**: Access to Google Workspace with admin permissions
3. **Pipedream Account**: Sign up at [pipedream.com](https://pipedream.com) (free tier available)
4. **Looker Access**: Admin access to configure scheduled email deliveries

### Setup Steps

1. **Set up Gmail API** (see `scripts/gmail-setup.md`) - ✅ Already done
2. **Get TRMNL Image Webhook URL** (from your TRMNL account)
3. **Install and configure local service** (see `SETUP_LOCAL.md`)
4. **Schedule daily execution** (cron or launchd)
5. **Configure Looker** (see `docs/looker-setup.md`)

## Architecture

```
Looker → Gmail → Local Script (Mac mini) → TRMNL Image API → E-ink Display
```

## Components

- **Local Service**: Runs on Mac mini, processes emails, generates PNG images
- **Gmail API**: Receives Looker scheduled emails within G Suite infrastructure
- **TRMNL Image API**: Receives PNG images and displays on e-ink

## Security

All email processing happens within your G Suite infrastructure. No third-party email vendors handle your company data.

## Documentation

- [Setup Guide](./SETUP_LOCAL.md) - Complete local setup instructions
- [Architecture](./ARCHITECTURE.md) - Architecture overview
- [Planning Document](./PLANNING.md) - Full planning details
- [Gmail API Setup](./scripts/gmail-setup.md) - Gmail API configuration guide
- [Looker Configuration](./docs/looker-setup.md) - Looker scheduled email setup
