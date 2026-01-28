# Gmail API Setup Guide

This guide walks you through setting up Gmail API access for the Looker to TRMNL pipeline.

## Prerequisites

- Google Workspace (G Suite) account with admin access
- Access to Google Cloud Console
- Ability to create service accounts or OAuth2 credentials

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click "Select a project" → "New Project"
3. Name it "Looker-TRMNL-Pipeline" (or your preferred name)
4. Click "Create"

## Step 2: Enable Gmail API

1. In your project, go to "APIs & Services" → "Library"
2. Search for "Gmail API"
3. Click on "Gmail API" and click "Enable"

## Step 3: Create OAuth2 Credentials

### Option A: Service Account (Recommended for automated workflows)

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "Service Account"
3. Name it "looker-trmnl-pipeline"
4. Grant it the "Gmail API User" role
5. Click "Done"
6. Click on the created service account
7. Go to "Keys" tab → "Add Key" → "Create new key"
8. Choose "JSON" format
9. Save the downloaded JSON file securely (you'll need it for the local service or GCP service)

### Option B: OAuth2 Client ID (For user-based access)

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Choose "Web application"
4. Name it "Looker TRMNL Pipeline"
5. Add authorized redirect URIs (for local OAuth2 flow, use e.g. `http://localhost` or the redirect URL shown by the local service when you run it)
6. Click "Create"
7. Save the Client ID and Client Secret (you'll add them to `local-service/.env`)

## Step 4: Configure Gmail Push Notifications (Optional but Recommended)

For real-time email detection instead of polling:

1. Go to "APIs & Services" → "Credentials"
2. Note your Project Number (found in project settings)
3. For the local service, polling (periodic Gmail API list/search) is used; no Pub/Sub required.

## Step 5: Create Dedicated Email Address

1. In Google Workspace Admin Console, create a dedicated email address:
   - Example: `looker-reports@yourdomain.com`
   - Or use an existing address and create a label/filter
2. This is the address Looker will send reports to

## Step 6: Set Up Gmail Filters (Optional)

1. In Gmail, go to Settings → Filters and Blocked Addresses
2. Create a filter for emails from Looker:
   - From: `looker@yourdomain.com` (or your Looker sender)
   - Apply label: "Looker Reports"
3. This helps organize and makes querying easier

## Step 7: Configure the Local Service (or GCP Service)

1. In `local-service/.env`, set:
   - `GMAIL_CLIENT_ID` and `GMAIL_CLIENT_SECRET` (OAuth2), or path to service account JSON
   - `TRMNL_WEBHOOK_URL` (your TRMNL Private Plugin webhook URL)
2. Run the local service; on first run with OAuth2, it will open a browser to authorize and save a token.
3. The service uses Gmail API to search for emails (e.g. `from:looker-studio-noreply@google.com`) and process them.

## Required Gmail API Scopes

The following scopes are needed:
- `https://www.googleapis.com/auth/gmail.readonly` - Read emails
- `https://www.googleapis.com/auth/gmail.modify` - Mark emails as read (optional)

The local service requests these when you complete the OAuth2 flow.

## Security Best Practices

1. **OAuth2 for user inbox**: Use OAuth2 if reading a user's Gmail; store token in `gmail-token.json` (add to `.gitignore`).
2. **Minimal Permissions**: Only grant the minimum required Gmail API scopes
3. **Secure Storage**: Keep credentials in `.env` (never commit); never commit `gmail-token.json`
4. **Monitor Access**: Regularly review API usage in Google Cloud Console
5. **Rotate Credentials**: Periodically rotate service account keys

## Troubleshooting

### "Access Denied" Errors
- Verify Gmail API is enabled in your project
- Check that OAuth2 credentials are correctly configured
- Ensure the service account has proper permissions

### Emails Not Detected
- Verify the Gmail query matches your Looker sender address
- Check that emails are arriving in the specified label/folder
- Increase polling interval if using polling instead of push notifications

### Rate Limiting
- Gmail API has rate limits (250 quota units per user per second)
- If hitting limits, increase polling interval or implement exponential backoff

## Next Steps

After completing this setup:
1. Proceed to [Local Service Setup](../local-service/README.md) or [SETUP_LOCAL.md](../SETUP_LOCAL.md)
2. Configure your Looker scheduled email delivery (`docs/looker-setup.md`)
3. Test the complete pipeline
