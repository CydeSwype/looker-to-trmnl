# Setup Guide: GCP Service (Recommended)

This guide walks you through setting up the Looker → TRMNL pipeline using a GCP Cloud Run service.

## Overview

We'll set up:
1. **Gmail API** - Access to receive Looker emails
2. **TRMNL Plugin** - Display template for reports
3. **GCP Service** - Processes emails and sends to TRMNL
4. **Cloud Scheduler** - Triggers daily execution
5. **Looker** - Scheduled email delivery

**Estimated Time**: 45-60 minutes

## Step 1: Gmail API Setup (15 minutes)

### 1.1 Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click "Select a project" → "New Project"
3. Name: `looker-to-trmnl` (or your choice)
4. Click "Create"
5. Wait for project creation, then select it

### 1.2 Enable Gmail API

1. In your project, go to **APIs & Services** → **Library**
2. Search for "Gmail API"
3. Click **Gmail API** → **Enable**

### 1.3 Create Service Account (Recommended)

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **Service Account**
3. Name: `looker-trmnl-service`
4. Grant role: **Gmail API User** (or create custom role with Gmail API scopes)
5. Click **Done**
6. Click on the created service account
7. Go to **Keys** tab → **Add Key** → **Create new key**
8. Choose **JSON** format
9. **Save the downloaded JSON file securely** - you'll need this!

### 1.4 Grant Service Account Gmail Access

**Important**: Service accounts can't access Gmail by default. You have two options:

#### Option A: Domain-Wide Delegation (Recommended for G Suite)
1. In service account details, check **Enable G Suite Domain-wide Delegation**
2. Note the **Client ID**
3. In Google Workspace Admin Console:
   - Go to **Security** → **API Controls** → **Domain-wide Delegation**
   - Add new client ID with scopes:
     - `https://www.googleapis.com/auth/gmail.readonly`
     - `https://www.googleapis.com/auth/gmail.modify`
4. Use the service account email as the **User Email** in your config

#### Option B: OAuth2 Client (Alternative)
1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Choose **Web application**
4. Name: `Looker TRMNL Pipeline`
5. Add authorized redirect URI: `http://localhost:8080` (for testing)
6. Click **Create**
7. **Save Client ID and Client Secret**

### 1.5 Create Dedicated Email Address

1. In Google Workspace Admin Console, create:
   - Email: `looker-reports@yourdomain.com`
   - Or use existing address
2. Set up Gmail filter (optional):
   - Settings → Filters → Create filter
   - From: `looker@yourdomain.com` (or your Looker sender)
   - Apply label: "Looker Reports"

**✅ Checkpoint**: You should have:
- [ ] Google Cloud project created
- [ ] Gmail API enabled
- [ ] Service account JSON file OR OAuth2 Client ID/Secret
- [ ] Target email address identified

---

## Step 2: TRMNL Plugin Setup (10 minutes)

### 2.1 Create TRMNL Account

1. Go to [trmnl.co](https://trmnl.co) and sign up
2. Set up your e-ink display device
3. Note your account details

### 2.2 Create Plugin

1. Log into TRMNL
2. Navigate to **Plugins** → **Create New Plugin**
3. Choose **Private Plugin**
4. Name: "Looker Report Display"
5. Copy the entire contents of `trmnl-plugin/plugin.html`
6. Paste into the TRMNL plugin editor
7. Click **Save**

### 2.3 Get Webhook URL

1. After saving, find your plugin's **Webhook URL**
2. It should look like: `https://api.trmnl.co/webhooks/your-plugin-id`
3. **Copy this URL** - you'll need it for the GCP service

**✅ Checkpoint**: You should have:
- [ ] TRMNL account created
- [ ] Plugin created and saved
- [ ] Webhook URL copied

---

## Step 3: GCP Service Setup (20 minutes)

### 3.1 Prepare Service Account Credentials

If using Service Account (recommended):
1. Open the JSON file you downloaded in Step 1.3
2. You'll need to set this as an environment variable

If using OAuth2:
1. You'll need Client ID and Client Secret

### 3.2 Local Testing (Optional but Recommended)

1. Navigate to the service directory:
   ```bash
   cd gcp-service
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file:
   ```bash
   cp .env.example .env
   ```

4. Edit `.env` with your values:
   ```bash
   # For Service Account (recommended)
   GMAIL_CREDENTIALS='{"type":"service_account","project_id":"..."}'  # Paste full JSON
   
   # OR for OAuth2
   # GMAIL_CLIENT_ID=your-client-id
   # GMAIL_CLIENT_SECRET=your-client-secret
   
   GMAIL_USER_EMAIL=looker-reports@yourdomain.com
   GMAIL_QUERY=from:looker@yourdomain.com
   TRMNL_WEBHOOK_URL=https://api.trmnl.co/webhooks/your-plugin-id
   ```

5. Test locally:
   ```bash
   npm start
   ```

6. In another terminal, test:
   ```bash
   curl http://localhost:8080/health
   curl -X POST http://localhost:8080/process
   ```

### 3.3 Deploy to Cloud Run

1. **Set up gcloud CLI** (if not already):
   ```bash
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   ```

2. **Build and deploy**:
   ```bash
   cd gcp-service
   
   # Deploy (Cloud Run will build the container)
   gcloud run deploy looker-to-trmnl \
     --source . \
     --region us-central1 \
     --allow-unauthenticated \
     --set-env-vars GMAIL_CREDENTIALS="$(cat /path/to/service-account.json | jq -c)", \
                    GMAIL_USER_EMAIL="looker-reports@yourdomain.com", \
                    GMAIL_QUERY="from:looker@yourdomain.com", \
                    TRMNL_WEBHOOK_URL="https://api.trmnl.co/webhooks/your-plugin-id", \
                    MAX_EMAILS_PER_RUN="10"
   ```

   **Note**: Replace paths and values with your actual values.

3. **Get service URL**:
   ```bash
   gcloud run services describe looker-to-trmnl \
     --region us-central1 \
     --format 'value(status.url)'
   ```

   Save this URL - you'll need it for Cloud Scheduler.

**✅ Checkpoint**: You should have:
- [ ] Service deployed to Cloud Run
- [ ] Service URL noted
- [ ] Tested health endpoint works

---

## Step 4: Cloud Scheduler Setup (5 minutes)

### 4.1 Create Scheduled Job

1. **Create daily cron job** (runs at 9 AM Pacific):
   ```bash
   SERVICE_URL=$(gcloud run services describe looker-to-trmnl \
     --region us-central1 \
     --format 'value(status.url)')
   
   gcloud scheduler jobs create http looker-to-trmnl-daily \
     --schedule="0 9 * * *" \
     --uri="$SERVICE_URL/cron" \
     --http-method=GET \
     --time-zone="America/Los_Angeles" \
     --location=us-central1
   ```

2. **Adjust schedule** as needed:
   - Change `"0 9 * * *"` to your desired time (cron format)
   - Change timezone to your preference

3. **Test the job**:
   ```bash
   gcloud scheduler jobs run looker-to-trmnl-daily --location=us-central1
   ```

4. **Check logs**:
   ```bash
   gcloud run services logs read looker-to-trmnl --region us-central1 --limit 50
   ```

**✅ Checkpoint**: You should have:
- [ ] Cloud Scheduler job created
- [ ] Tested manual execution
- [ ] Verified logs show successful processing

---

## Step 5: Looker Configuration (10 minutes)

### 5.1 Configure Scheduled Email

1. Navigate to your Looker report/dashboard
2. Click **Schedule** button
3. Configure:
   - **Delivery Method**: Email
   - **Recipients**: `looker-reports@yourdomain.com` (from Step 1.5)
   - **Subject**: "Daily Sales Report" (or your title)
   - **Format**: **CSV** (recommended for easy parsing)
   - **Attach Results**: Yes
   - **Include Headers**: Yes
   - **Frequency**: Daily
   - **Time**: Set to run before your Cloud Scheduler time (e.g., 8 AM if scheduler runs at 9 AM)
   - **Timezone**: Your timezone

4. **Send test email**:
   - Click "Send Now" or "Test"
   - Verify email arrives in Gmail
   - Check that your GCP service processes it (check logs)

### 5.2 Verify End-to-End

1. **Wait for scheduled execution** or trigger manually:
   ```bash
   gcloud scheduler jobs run looker-to-trmnl-daily --location=us-central1
   ```

2. **Check Cloud Run logs**:
   ```bash
   gcloud run services logs read looker-to-trmnl --region us-central1 --limit 20
   ```

3. **Verify TRMNL display** updates with report data

**✅ Checkpoint**: You should have:
- [ ] Looker schedule configured
- [ ] Test email sent and processed
- [ ] TRMNL display shows report data
- [ ] End-to-end pipeline working

---

## Verification Checklist

After completing all steps:

- [ ] Gmail API credentials configured
- [ ] TRMNL plugin created and webhook URL obtained
- [ ] GCP service deployed and accessible
- [ ] Cloud Scheduler job created and tested
- [ ] Looker schedule configured
- [ ] Test email processed successfully
- [ ] TRMNL display shows report data
- [ ] Daily automation working

---

## Troubleshooting

### Service won't start
- Check environment variables in Cloud Run
- Verify Gmail API credentials format (must be valid JSON string)
- Check Cloud Run logs: `gcloud run services logs read looker-to-trmnl --region us-central1`

### Emails not found
- Verify Gmail query matches your Looker sender: `from:looker@yourdomain.com`
- Check emails are in INBOX or specified label
- Ensure service account has Gmail API access
- Test Gmail API access manually

### TRMNL not receiving data
- Verify webhook URL is correct
- Check TRMNL plugin is active
- Review service logs for HTTP errors
- Test webhook manually with curl

### Parsing errors
- Verify CSV format from Looker
- Check email attachment is included
- Review service logs for parsing errors
- Test with sample CSV using `scripts/parse-csv.js`

---

## Cost Monitoring

Monitor your costs:
- **Cloud Run**: Should be ~$0.40/month for daily execution
- **Gmail API**: Free within quota (250 quota units/user/second)
- **Cloud Scheduler**: Free (first 3 jobs)

Set up billing alerts in Google Cloud Console if desired.

---

## Next Steps

Once everything is working:

1. **Customize TRMNL Plugin**: Edit `trmnl-plugin/plugin.html` for your brand/style
2. **Add More Reports**: Create additional TRMNL plugins for different reports
3. **Optimize Display**: Adjust data formatting for your e-ink display
4. **Set Up Monitoring**: Add error notifications/alerts
5. **Document Your Setup**: Note any customizations

---

## Support

- **GCP Service Logs**: `gcloud run services logs read looker-to-trmnl --region us-central1`
- **Cloud Scheduler**: Check job execution history in Console
- **Gmail API**: Review API usage in Google Cloud Console
- **TRMNL**: Check plugin logs in TRMNL dashboard

---

**Ready to start?** Begin with Step 1: Gmail API Setup!
