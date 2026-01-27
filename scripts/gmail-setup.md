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
9. Save the downloaded JSON file securely (you'll need it for Pipedream)

### Option B: OAuth2 Client ID (For user-based access)

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Choose "Web application"
4. Name it "Looker TRMNL Pipeline"
5. Add authorized redirect URIs:
   - `https://api.pipedream.com/v1/oauth/callback/gmail`
6. Click "Create"
7. Save the Client ID and Client Secret (you'll need them for Pipedream)

## Step 4: Configure Gmail Push Notifications (Optional but Recommended)

For real-time email detection instead of polling:

1. Go to "APIs & Services" → "Credentials"
2. Note your Project Number (found in project settings)
3. You'll need to set up a Pub/Sub topic (Pipedream can handle this automatically)

### Using Pipedream's Built-in Gmail Integration

Pipedream can handle Gmail Push Notifications automatically when you:
1. Connect your Gmail account in Pipedream
2. Select "Gmail - New Email" trigger
3. Pipedream will set up the necessary Pub/Sub infrastructure

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

## Step 7: Configure Pipedream

1. In your Pipedream workflow, add the Gmail trigger
2. When prompted, connect your Gmail account:
   - For OAuth2: Use the Client ID and Client Secret from Step 3
   - For Service Account: Upload the JSON key file from Step 3
3. Configure the trigger:
   - **Label**: "Looker Reports" (or "INBOX")
   - **Query**: `from:looker@yourdomain.com` (adjust to your sender)
   - **Polling Interval**: 5 minutes (or use Push Notifications)

## Required Gmail API Scopes

The following scopes are needed:
- `https://www.googleapis.com/auth/gmail.readonly` - Read emails
- `https://www.googleapis.com/auth/gmail.modify` - Mark emails as read (optional)

Pipedream will request these automatically when you connect your Gmail account.

## Security Best Practices

1. **Use Service Account**: For automated workflows, service accounts are more secure than user OAuth
2. **Minimal Permissions**: Only grant the minimum required Gmail API scopes
3. **Secure Storage**: Store credentials securely (Pipedream encrypts them)
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
1. Proceed to [Pipedream Workflow Setup](../pipedream-workflow/README.md)
2. Configure your Looker scheduled email delivery
3. Test the complete pipeline
