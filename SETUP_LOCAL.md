# Setup Guide: Local Service (Mac mini)

This guide walks you through setting up the Looker → TRMNL pipeline to run locally on your Mac mini.

## Overview

We'll set up:
1. **Gmail API** - Service account credentials (already done ✅)
2. **TRMNL Image Webhook** - Get your image webhook URL
3. **Local Service** - Install and configure the script
4. **Scheduling** - Set up daily execution with cron or launchd
5. **Looker** - Configure scheduled email delivery

**Estimated Time**: 20-30 minutes

## Prerequisites

- ✅ Gmail API service account JSON file (`example-project-for-ian-e67ca0405681.json`)
- [ ] Node.js 18+ installed on Mac mini
- [ ] TRMNL account with image webhook URL
- [ ] Looker access for scheduled emails

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
   # Path to service account JSON (relative to local-service directory)
   GMAIL_CREDENTIALS_PATH=../example-project-for-ian-e67ca0405681.json
   
   # Gmail settings
   GMAIL_USER_EMAIL=looker-reports@yourdomain.com
   GMAIL_QUERY=from:looker@yourdomain.com
   
   # TRMNL image webhook URL (get from TRMNL account)
   TRMNL_IMAGE_WEBHOOK_URL=https://api.trmnl.co/webhooks/images/your-webhook-id
   
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

3. Check the output - you should see:
   ```
   [INFO] Searching for emails with query: from:looker@yourdomain.com
   [INFO] Found 1 email(s)
   [INFO] Successfully processed email: Daily Sales Report
   [INFO] Sent image to TRMNL: 200
   [INFO] Processing complete: { processed: 1, failed: 0, ... }
   ```

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
   - **Recipients**: `looker-reports@yourdomain.com` (from Step 3)
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
- Verify service account JSON file path in `.env`
- Check file exists: `ls -la ../example-project-for-ian-e67ca0405681.json`
- Verify service account has Gmail API access enabled

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
