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

1. **Set up Gmail API** (see `scripts/gmail-setup.md`)
2. **Deploy TRMNL Plugin** (see `trmnl-plugin/README.md`)
3. **Configure Pipedream Workflow** (see `pipedream-workflow/README.md`)
4. **Configure Looker** (see `docs/looker-setup.md`)

## Architecture

```
Looker → Gmail → Pipedream → TRMNL Plugin → E-ink Display
```

## Components

- **TRMNL Plugin**: Receives webhook data and renders content for e-ink display
- **Pipedream Workflow**: Monitors Gmail, parses emails, transforms data, sends to TRMNL
- **Gmail API**: Receives Looker scheduled emails within G Suite infrastructure

## Security

All email processing happens within your G Suite infrastructure. No third-party email vendors handle your company data.

## Documentation

- [Planning Document](./PLANNING.md) - Full architecture and planning details
- [TRMNL Plugin Setup](./trmnl-plugin/README.md) - Plugin deployment guide
- [Pipedream Workflow Setup](./pipedream-workflow/README.md) - Workflow configuration
- [Gmail API Setup](./scripts/gmail-setup.md) - Gmail API configuration guide
- [Looker Configuration](./docs/looker-setup.md) - Looker scheduled email setup
