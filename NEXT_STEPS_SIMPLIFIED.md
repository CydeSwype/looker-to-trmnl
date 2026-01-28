# Quick Start: Local Setup

Short path to run the Looker → TRMNL pipeline on your own machine.

## What You’ll Set Up

- **Local service** – Runs on your machine (e.g. Mac, Linux, always-on PC), no cloud required
- **Gmail API** – Service reads report emails from your inbox (or a dedicated address)
- **TRMNL** – Private Plugin webhook or Image webhook receives the data or image

## Steps

### 1. Gmail API credentials

- Create a Google Cloud project and enable Gmail API
- Create OAuth2 credentials (for a user inbox) or a service account
- See [scripts/gmail-setup.md](scripts/gmail-setup.md)

### 2. TRMNL webhook URL

- Log into [TRMNL](https://usetrmnl.com)
- Create a Private Plugin (webhook) or get an Image webhook URL
- Copy the webhook URL for the next step

### 3. Install and configure the local service

```bash
cd local-service
npm install
cp .env.example .env
```

Edit `.env`:

```bash
# Path to your Gmail credentials JSON (OAuth2 client secret or service account)
GMAIL_CREDENTIALS_PATH=path/to/your-credentials.json

# Gmail address that receives Looker reports, and search query
GMAIL_USER_EMAIL=you@example.com
GMAIL_QUERY=from:looker-studio-noreply@google.com

# TRMNL webhook URL from step 2
TRMNL_IMAGE_WEBHOOK_URL=https://usetrmnl.com/api/plugin_settings/YOUR_ID/image
```

### 4. Test

```bash
node index.js
```

Confirm logs show the Gmail query, emails found, and a successful TRMNL response.

### 5. Schedule (e.g. daily)

- **Cron**: `crontab -e` and add a line like  
  `0 9 * * * cd /path/to/looker-to-trmnl/local-service && node index.js >> /tmp/looker-trmnl.log 2>&1`
- **macOS launchd**: See [SETUP_LOCAL.md](SETUP_LOCAL.md) Step 6

### 6. Looker

- Schedule your report to email the same address as `GMAIL_USER_EMAIL`
- Use a subject and format that match what the service expects (see [docs/looker-setup.md](docs/looker-setup.md))

## More detail

- Full local setup: [SETUP_LOCAL.md](SETUP_LOCAL.md)
- End-to-end flow: [SETUP.md](SETUP.md)
- Architecture: [ARCHITECTURE.md](ARCHITECTURE.md)
