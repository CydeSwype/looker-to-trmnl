# Next Steps: Simplified Local Setup

## What's Changed

✅ **Removed Pipedream** - No cloud service needed
✅ **Local Service** - Runs on your Mac mini
✅ **PNG Images** - Direct image upload to TRMNL
✅ **Simplified Architecture** - Looker → Gmail → Local Script → TRMNL

## What You Need to Do

### 1. Get TRMNL Image Webhook URL (5 min)

1. Log into your TRMNL account
2. Navigate to **Settings** → **Webhooks** or **Image Webhooks**
3. Find or create an **Image Webhook URL**
   - Should look like: `https://api.trmnl.co/webhooks/images/{id}`
4. **Copy this URL** - you'll need it in the next step

**Note**: If you don't see an image webhook option, check TRMNL documentation or contact support. The endpoint should accept POST requests with multipart/form-data containing a PNG image.

### 2. Install and Configure Local Service (10 min)

1. **Navigate to service directory:**
   ```bash
   cd local-service
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```
   
   If `canvas` fails to install, install native libraries first:
   ```bash
   brew install pkg-config cairo pango libpng jpeg giflib librsvg
   npm install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   ```

4. **Edit `.env` file:**
   ```bash
   # Path to your service account JSON (already in repo root)
   GMAIL_CREDENTIALS_PATH=../example-project-for-ian-e67ca0405681.json
   
   # Gmail settings - UPDATE THESE
   GMAIL_USER_EMAIL=looker-reports@yourdomain.com
   GMAIL_QUERY=from:looker@yourdomain.com
   
   # TRMNL image webhook URL - FROM STEP 1
   TRMNL_IMAGE_WEBHOOK_URL=https://api.trmnl.co/webhooks/images/your-webhook-id
   
   # Image dimensions (adjust if needed)
   IMAGE_WIDTH=800
   IMAGE_HEIGHT=600
   ```

### 3. Test the Service (5 min)

1. **Make sure you have a test email from Looker in Gmail**

2. **Run the service:**
   ```bash
   node index.js
   ```

3. **Check output** - should see:
   ```
   [INFO] Searching for emails with query: from:looker@yourdomain.com
   [INFO] Found 1 email(s)
   [INFO] Successfully processed email: Daily Sales Report
   [INFO] Sent image to TRMNL: 200
   ```

4. **Verify image appears on TRMNL display**

### 4. Schedule Daily Execution (5 min)

**Option A: Cron (Simple)**
```bash
crontab -e
```

Add:
```
0 9 * * * cd /full/path/to/looker-to-trmnl/local-service && /usr/local/bin/node index.js >> /tmp/looker-trmnl.log 2>&1
```

**Option B: launchd (macOS - Recommended)**
See `SETUP_LOCAL.md` Step 6 for detailed launchd setup.

### 5. Configure Looker (5 min)

1. Go to your Looker report
2. Click **Schedule**
3. Set:
   - **Recipients**: `looker-reports@yourdomain.com`
   - **Format**: **CSV**
   - **Attach Results**: Yes
   - **Frequency**: Daily
   - **Time**: Before your script runs (e.g., 8 AM if script runs at 9 AM)

## Information I Need

Once you've completed the steps above, let me know:

1. ✅ **Gmail API credentials** - Already have (`example-project-for-ian-e67ca0405681.json`)
2. [ ] **TRMNL Image Webhook URL** - From Step 1
3. [ ] **Gmail email address** - Where Looker sends reports
4. [ ] **Looker sender email** - For the Gmail query filter
5. [ ] **Test results** - Did the manual test work?

## Quick Reference

- **Setup Guide**: `SETUP_LOCAL.md` - Complete detailed instructions
- **Architecture**: `ARCHITECTURE.md` - How it all works
- **Service Code**: `local-service/` - The actual script

## Troubleshooting

### Canvas won't install
```bash
brew install pkg-config cairo pango libpng jpeg giflib librsvg
npm install
```

### No emails found
- Check Gmail query matches your Looker sender
- Verify emails are in INBOX
- Test with a manual email first

### TRMNL not receiving images
- Verify image webhook URL is correct
- Check TRMNL account settings
- Review logs for errors

---

**Ready?** Start with Step 1: Get your TRMNL Image Webhook URL!
