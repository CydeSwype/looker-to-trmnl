# Setup Guide - Looker to TRMNL Pipeline

This is a step-by-step guide to get your Looker to TRMNL pipeline up and running.

## Overview

The setup process involves:
1. Setting up Gmail API access
2. Creating and deploying the TRMNL plugin
3. Configuring the Pipedream workflow
4. Configuring Looker scheduled emails

**Estimated Time**: 30-60 minutes

## Prerequisites Checklist

- [ ] TRMNL account created
- [ ] G Suite/Google Workspace admin access
- [ ] Pipedream account (free tier works)
- [ ] Looker admin access
- [ ] A Looker report you want to display

## Step-by-Step Setup

### Step 1: Gmail API Setup (15 minutes)

1. Follow the detailed guide: [`scripts/gmail-setup.md`](./scripts/gmail-setup.md)
2. Create a Google Cloud project
3. Enable Gmail API
4. Create OAuth2 credentials or service account
5. Create a dedicated email address (e.g., `looker-reports@yourdomain.com`)
6. Set up Gmail filters (optional but recommended)

**Key Outputs:**
- OAuth2 Client ID and Secret (or Service Account JSON)
- Target email address for Looker

### Step 2: TRMNL Plugin Setup (10 minutes)

1. Log into your TRMNL account
2. Navigate to Plugins → Create New Plugin
3. Choose "Private Plugin"
4. Copy the entire contents of [`trmnl-plugin/plugin.html`](./trmnl-plugin/plugin.html)
5. Paste into the TRMNL plugin editor
6. Save the plugin
7. **Important**: Copy your plugin's webhook URL (you'll need this for Pipedream)

**Key Outputs:**
- TRMNL plugin webhook URL

### Step 3: Pipedream Workflow Setup (15 minutes)

1. Log into [Pipedream](https://pipedream.com)
2. Click "New Workflow" → "Start from scratch"

#### 3a. Add Gmail Trigger

1. Click "+" to add a step
2. Search for "Gmail" → Select "Gmail - New Email"
3. Click "Connect Account"
4. Choose authentication method:
   - **OAuth2**: Enter Client ID and Secret from Step 1
   - **Service Account**: Upload the JSON key file
5. Configure trigger:
   - **Label**: "INBOX" or "Looker Reports"
   - **Query**: `from:looker@yourdomain.com` (adjust to your Looker sender)
   - **Polling Interval**: 5 minutes (or enable Push Notifications)

#### 3b. Add Email Parsing Step

1. Add new step: "Code" → "Run Node.js code"
2. Name it "Parse Email"
3. Copy code from [`pipedream-workflow/parse-email.js`](./pipedream-workflow/parse-email.js)
4. Paste into the code editor
5. Save

#### 3c. Add Data Transformation Step

1. Add another "Code" step
2. Name it "Transform Data"
3. Copy code from [`pipedream-workflow/transform-data.js`](./pipedream-workflow/transform-data.js)
4. Paste into the code editor
5. Save

#### 3d. Add TRMNL Webhook Step

1. Add new step: "HTTP" → "Make HTTP Request"
2. Configure:
   - **Method**: POST
   - **URL**: Your TRMNL plugin webhook URL from Step 2
   - **Headers**:
     ```
     Content-Type: application/json
     ```
   - **Body**: 
     ```json
     {{steps.transform_data.$return_value}}
     ```
3. Save

#### 3e. Test the Workflow

1. Click "Test" or "Send Test Event"
2. Or send a test email from Looker
3. Check execution logs to verify each step works
4. Verify data appears on your TRMNL display

**Key Outputs:**
- Working Pipedream workflow
- Verified TRMNL webhook connection

### Step 4: Configure Looker (10 minutes)

1. Follow the detailed guide: [`docs/looker-setup.md`](./docs/looker-setup.md)
2. Navigate to your Looker report
3. Click "Schedule"
4. Configure:
   - **Recipients**: Your G Suite email address from Step 1
   - **Format**: CSV (recommended) or PDF
   - **Frequency**: Daily, weekly, etc.
   - **Subject**: Descriptive title (will appear on TRMNL)
5. Send a test email
6. Verify it triggers your Pipedream workflow

**Key Outputs:**
- Active Looker schedule
- Verified email delivery

## Verification Checklist

After completing all steps, verify:

- [ ] Test email from Looker arrives in Gmail
- [ ] Pipedream workflow detects the email
- [ ] Email parsing step extracts data correctly
- [ ] Data transformation creates valid TRMNL payload
- [ ] TRMNL display updates with report data
- [ ] Scheduled Looker emails trigger the pipeline automatically

## Troubleshooting

### Email Not Detected by Pipedream

- Check Gmail query matches your Looker sender address
- Verify emails are in the specified label/folder
- Check Pipedream execution logs for errors
- Increase polling interval if using polling

### Data Not Appearing on TRMNL

- Verify TRMNL webhook URL is correct
- Check Pipedream HTTP request step for errors
- Verify TRMNL plugin is active and saved
- Check TRMNL plugin logs/console

### Parsing Errors

- Verify CSV format from Looker
- Check email attachment is included
- Review parse-email.js logs in Pipedream
- Test with sample CSV using `scripts/parse-csv.js`

### Gmail API Errors

- Verify Gmail API is enabled in Google Cloud Console
- Check OAuth2 credentials are correct
- Ensure proper scopes are granted
- Review Google Cloud Console API usage logs

## Next Steps

Once everything is working:

1. **Customize the TRMNL Plugin**: Edit `plugin.html` to match your brand/style
2. **Add More Reports**: Configure additional Looker schedules
3. **Optimize Display**: Adjust data formatting for your e-ink display size
4. **Set Up Monitoring**: Add error notifications/alerts in Pipedream
5. **Document Your Setup**: Note any customizations for future reference

## Support Resources

- [TRMNL Documentation](https://trmnl.co/docs)
- [Pipedream Documentation](https://pipedream.com/docs)
- [Gmail API Documentation](https://developers.google.com/gmail/api)
- [Looker Scheduling Docs](https://docs.cloud.google.com/looker/docs/scheduling)

## Getting Help

If you encounter issues:

1. Check the troubleshooting section above
2. Review Pipedream execution logs
3. Test individual components (Gmail API, TRMNL webhook)
4. Review the detailed guides in each component's README

---

**Ready to start?** Begin with [Step 1: Gmail API Setup](./scripts/gmail-setup.md)
