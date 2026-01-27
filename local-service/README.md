# Local Service: Looker to TRMNL Pipeline

This service runs locally on your Mac mini to process Looker report emails and send PNG images directly to TRMNL.

## Architecture

```
Looker → Gmail → Local Script (Mac mini) → TRMNL Image API → E-ink Display
```

## Features

- ✅ Polls Gmail API for Looker report emails
- ✅ Parses CSV attachments from emails
- ✅ Generates PNG images from data
- ✅ POSTs PNG directly to TRMNL image webhook
- ✅ Runs locally (no cloud services needed)
- ✅ Can be scheduled with cron or launchd

## Setup

### 1. Install Dependencies

```bash
cd local-service
npm install
```

**Note**: The `canvas` package requires native dependencies. On macOS, you may need:

```bash
brew install pkg-config cairo pango libpng jpeg giflib librsvg
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your values:

```bash
# Path to your service account JSON file
GMAIL_CREDENTIALS_PATH=../example-project-for-ian-e67ca0405681.json

# Gmail settings
GMAIL_USER_EMAIL=looker-reports@yourdomain.com
GMAIL_QUERY=from:looker@yourdomain.com

# TRMNL image webhook URL
TRMNL_IMAGE_WEBHOOK_URL=https://api.trmnl.co/webhooks/images/your-webhook-id
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
- `GMAIL_QUERY`: Gmail search query (e.g., `from:looker@yourdomain.com`)
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
