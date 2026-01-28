# Setup Guide: Local Service

This guide walks you through setting up the Looker → TRMNL pipeline to run locally on your machine (e.g. a Mac, Linux server, or always-on PC).

## Overview

1. **Gmail API** – OAuth2 or service account credentials so the service can read report emails
2. **TRMNL** – Private Plugin webhook URL or Image webhook URL
3. **Local Service** – Install dependencies and configure `.env`
4. **Scheduling** – Run on a schedule (cron or launchd on macOS)
5. **Looker** – Configure scheduled email to the Gmail address the service reads

**Estimated time**: 30–45 minutes

## Prerequisites

- Node.js 18+ installed
- Gmail API credentials (OAuth2 client or service account JSON) – see [scripts/gmail-setup.md](scripts/gmail-setup.md)
- TRMNL account and webhook URL (Private Plugin or Image webhook)
- Looker or Looker Studio access to schedule report emails

## Step 1: Install Node.js (if needed)

Check if Node.js is installed:
```bash
node --version
```

If not installed, install via Homebrew:
```bash
brew install node
```

Or download from [nodejs.org](https://nodejs.org/)

## Step 2: Install Service Dependencies

1. Navigate to the service directory:
   ```bash
   cd local-service
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

   **Note**: The `canvas` package requires native libraries. If installation fails, install:
   ```bash
   brew install pkg-config cairo pango libpng jpeg giflib librsvg
   npm install
   ```

## Step 3: Configure Environment

1. Copy environment template:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your values:
   ```bash
   # Path to Gmail credentials: OAuth2 client secret JSON or service account JSON
   # Example: GMAIL_CREDENTIALS_PATH=./credentials.json
   GMAIL_CREDENTIALS_PATH=path/to/your-gmail-credentials.json
   
   # Gmail: address that receives Looker reports, and search query
   GMAIL_USER_EMAIL=you@example.com
   GMAIL_QUERY=from:looker-studio-noreply@google.com
   
   # TRMNL: Image webhook URL (from TRMNL account)
   TRMNL_IMAGE_WEBHOOK_URL=https://usetrmnl.com/api/plugin_settings/YOUR_ID/image
   
   # Optional: API key if TRMNL requires it
   # TRMNL_API_KEY=your-api-key
   
   # Image dimensions (adjust for your display)
   IMAGE_WIDTH=800
   IMAGE_HEIGHT=600
   ```

## Step 4: Get TRMNL Image Webhook URL

1. Log into your TRMNL account
2. Navigate to **Settings** or **Webhooks**
3. Find your **Image Webhook URL**
   - Should look like: `https://api.trmnl.co/webhooks/images/{id}`
4. Copy the URL and add it to `.env`

**Note**: If you don't have an image webhook yet, you may need to create one in your TRMNL account settings.

## Step 5: Test the Service

1. Make sure you have a test email from Looker in Gmail
2. Run the service manually:
   ```bash
   node index.js
   ```

3. Check the output – you should see log lines for the Gmail query, emails found, and TRMNL response (e.g. 200).

4. Verify the image appears on your TRMNL display

## Step 6: Schedule Daily Execution

### Option A: Using Cron (Simple)

1. Edit crontab:
   ```bash
   crontab -e
   ```

2. Add line (runs daily at 9 AM):
   ```bash
   0 9 * * * cd /path/to/looker-to-trmnl/local-service && /usr/local/bin/node index.js >> /tmp/looker-trmnl.log 2>&1
   ```

   **Important**: Replace `/path/to/looker-to-trmnl` with your actual path

3. Verify cron job:
   ```bash
   crontab -l
   ```

### Option B: Using launchd (macOS Recommended)

1. Create plist file:
   ```bash
   nano ~/Library/LaunchAgents/com.looker.trmnl.plist
   ```

2. Paste this (adjust paths):
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
       <key>WorkingDirectory</key>
       <string>/path/to/looker-to-trmnl/local-service</string>
       <key>EnvironmentVariables</key>
       <dict>
           <key>PATH</key>
           <string>/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin</string>
       </dict>
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

3. Replace `/path/to/looker-to-trmnl` with your actual path
4. Replace `/usr/local/bin/node` with your Node.js path (find with `which node`)

5. Load the service:
   ```bash
   launchctl load ~/Library/LaunchAgents/com.looker.trmnl.plist
   ```

6. Verify it's loaded:
   ```bash
   launchctl list | grep looker
   ```

7. Test manually:
   ```bash
   launchctl start com.looker.trmnl
   ```

## Step 7: Configure Looker

1. Navigate to your Looker report
2. Click **Schedule**
3. Configure:
   - **Recipients**: The Gmail address you configured in `.env` as `GMAIL_USER_EMAIL`
   - **Format**: **CSV** (recommended)
   - **Attach Results**: Yes
   - **Frequency**: Daily
   - **Time**: Set to run before your scheduled script (e.g., 8 AM if script runs at 9 AM)
   - **Subject**: Descriptive title

4. Send a test email
5. Verify it's processed by checking logs:
   ```bash
   tail -f /tmp/looker-trmnl.log
   ```

## Verification Checklist

- [ ] Node.js installed and working
- [ ] Service dependencies installed
- [ ] `.env` file configured with correct values
- [ ] TRMNL image webhook URL obtained
- [ ] Manual test run successful
- [ ] Image appears on TRMNL display
- [ ] Cron or launchd schedule configured
- [ ] Looker schedule configured
- [ ] End-to-end test successful

## Monitoring

### Check Logs

**If using cron:**
```bash
tail -f /tmp/looker-trmnl.log
```

**If using launchd:**
```bash
tail -f /tmp/looker-trmnl.log
tail -f /tmp/looker-trmnl-error.log
```

### Test Manually

Run the service manually anytime:
```bash
cd local-service
node index.js
```

### Check Schedule Status

**Cron:**
```bash
crontab -l
```

**launchd:**
```bash
launchctl list | grep looker
```

## Troubleshooting

### Canvas library won't install
```bash
brew install pkg-config cairo pango libpng jpeg giflib librsvg
npm install
```

### Gmail API errors
- Verify the credentials file path in `.env` (`GMAIL_CREDENTIALS_PATH`)
- Ensure the file exists and is valid JSON (OAuth2 client secret or service account)
- If using OAuth2, run the service once to complete the browser flow and save the token
- Verify Gmail API is enabled in your Google Cloud project

### No emails found
- Verify Gmail query matches your Looker sender
- Check emails are in INBOX
- Test with a manual email first

### TRMNL not receiving images
- Verify image webhook URL is correct
- Check TRMNL account settings
- Review logs for HTTP errors

### launchd not running
- Check logs: `cat /tmp/looker-trmnl-error.log`
- Verify paths in plist file are correct
- Reload: `launchctl unload ~/Library/LaunchAgents/com.looker.trmnl.plist && launchctl load ~/Library/LaunchAgents/com.looker.trmnl.plist`

## Next Steps

Once everything is working:

1. **Customize Image Format**: Adjust `IMAGE_WIDTH` and `IMAGE_HEIGHT` in `.env`
2. **Add More Reports**: Create additional TRMNL image webhooks for different reports
3. **Optimize Display**: Adjust PNG generation code for your display size
4. **Set Up Monitoring**: Add email notifications for errors (optional)

---

**Ready to start?** Begin with Step 1: Install Node.js!
