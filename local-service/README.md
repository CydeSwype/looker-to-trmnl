# Local Service: Looker to TRMNL Pipeline

This service runs on your machine to process Looker (or Looker Studio) report emails and send data or images to TRMNL.

## Architecture

```
Looker (scheduled email) → Gmail → Local service → TRMNL webhook / Image API → E-ink display
```

## Features

- Polls Gmail API for report emails (configurable query)
- Parses PDF or CSV attachments and extracts table data
- Can send JSON to a TRMNL Private Plugin webhook or PNG to an Image webhook
- Runs locally (no third-party workflow service)
- Can be scheduled with cron or launchd (macOS)

## Setup

### 1. Install Dependencies

```bash
cd local-service
npm install
```

On macOS, if `canvas` fails to install:

```bash
brew install pkg-config cairo pango libpng jpeg giflib librsvg
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your values:

```bash
# Path to Gmail credentials (OAuth2 client secret JSON or service account JSON)
GMAIL_CREDENTIALS_PATH=path/to/your-credentials.json

# Gmail address that receives Looker reports, and search query
GMAIL_USER_EMAIL=you@example.com
GMAIL_QUERY=from:looker-studio-noreply@google.com

# TRMNL webhook URL (from your TRMNL Private Plugin or Image webhook)
TRMNL_IMAGE_WEBHOOK_URL=https://usetrmnl.com/api/plugin_settings/YOUR_ID/image
```

### 3. Test Run

```bash
node index.js
```

This will:
1. Check Gmail for new Looker emails
2. Parse CSV data
3. Generate PNG image
4. Send to TRMNL

### 4. Schedule with Cron

Add to crontab for daily execution at 9 AM:

```bash
crontab -e
```

Add line:
```
0 9 * * * cd /path/to/looker-to-trmnl/local-service && /usr/local/bin/node index.js >> /tmp/looker-trmnl.log 2>&1
```

### 5. Schedule with launchd (macOS)

Create `~/Library/LaunchAgents/com.looker.trmnl.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.looker.trmnl</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/node</string>
        <string>/path/to/looker-to-trmnl/local-service/index.js</string>
    </array>
    <key>StartCalendarInterval</key>
    <dict>
        <key>Hour</key>
        <integer>9</integer>
        <key>Minute</key>
        <integer>0</integer>
    </dict>
    <key>StandardOutPath</key>
    <string>/tmp/looker-trmnl.log</string>
    <key>StandardErrorPath</key>
    <string>/tmp/looker-trmnl-error.log</string>
</dict>
</plist>
```

Load it:
```bash
launchctl load ~/Library/LaunchAgents/com.looker.trmnl.plist
```

## Configuration

### Environment Variables

- `GMAIL_CREDENTIALS_PATH`: Path to service account JSON file
- `GMAIL_USER_EMAIL`: Email address to check
- `GMAIL_QUERY`: Gmail search query (e.g. `from:looker-studio-noreply@google.com` for Looker Studio)
- `TRMNL_IMAGE_WEBHOOK_URL`: TRMNL image webhook URL
- `TRMNL_API_KEY`: Optional API key
- `MAX_EMAILS_PER_RUN`: Max emails to process (default: 10)
- `IMAGE_WIDTH`: PNG width in pixels (default: 800)
- `IMAGE_HEIGHT`: PNG height in pixels (default: 600)

## TRMNL Image Webhook

The service POSTs PNG images to TRMNL's image webhook endpoint. The format is:

```
POST /webhooks/images/{webhook-id}
Content-Type: multipart/form-data

image: <PNG file>
```

Get your image webhook URL from your TRMNL account settings.

## Troubleshooting

### Canvas library won't install
- Install native dependencies: `brew install pkg-config cairo pango libpng jpeg giflib librsvg`
- Or use `npm install --build-from-source`

### Gmail API errors
- Verify service account JSON file path is correct
- Check service account has Gmail API access
- Ensure domain-wide delegation is set up (if needed)

### TRMNL not receiving images
- Verify image webhook URL is correct
- Check TRMNL account settings
- Review logs: `/tmp/looker-trmnl.log`

### No emails found
- Verify Gmail query matches your Looker sender
- Check emails are in INBOX
- Test Gmail API access manually

## Logs

Check logs:
```bash
tail -f /tmp/looker-trmnl.log
```

Or if using launchd:
```bash
tail -f /tmp/looker-trmnl-error.log
```

## Next Steps

1. Test the service manually
2. Set up cron or launchd schedule
3. Configure Looker to send daily emails
4. Monitor logs for first few executions
5. Adjust image size/format as needed
