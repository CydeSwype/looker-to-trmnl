# Setup Guide - Looker to TRMNL Pipeline

This is a step-by-step guide to get your Looker to TRMNL pipeline up and running.

## Architecture Options

You have two options for the workflow automation layer:

### Option A: Local Service (Recommended) ⭐
- **Cost**: Free (runs on your machine, e.g. Mac mini)
- **Control**: Full control over code and execution
- **Setup**: See [SETUP_LOCAL.md](./SETUP_LOCAL.md)
- **Best for**: Simple setup, no cloud spend, single machine always on

### Option B: GCP Service
- **Cost**: ~$0.40/month (Cloud Run)
- **Control**: Full control over code and execution
- **Setup**: See [SETUP_GCP_SERVICE.md](./SETUP_GCP_SERVICE.md)
- **Best for**: Serverless, no local machine required

**Recommendation**: Use the local service for simplicity and zero cost.

## Overview

The setup process involves:
1. Setting up Gmail API access
2. Creating and configuring the TRMNL Private Plugin
3. **Choose one**: Running the local service OR deploying the GCP service
4. Configuring Looker scheduled emails

**Estimated Time**: 45–60 minutes (local service) or 60–90 minutes (GCP)

## Prerequisites Checklist

- [ ] TRMNL account created
- [ ] Gmail / Google account (OAuth2 or service account for Gmail API)
- [ ] Looker admin access
- [ ] A Looker report you want to display

## Step-by-Step Setup

### Step 1: Gmail API Setup (15 minutes)

1. Follow the detailed guide: [`scripts/gmail-setup.md`](./scripts/gmail-setup.md)
2. Create a Google Cloud project
3. Enable Gmail API
4. Create OAuth2 credentials (recommended for user inbox) or a service account
5. Use the email address that receives Looker reports (e.g. `you@yourdomain.com`)
6. Set up Gmail filters (optional but recommended)

**Key Outputs:**
- OAuth2 Client ID and Secret (or Service Account JSON)
- Target email address for Looker

### Step 2: TRMNL Plugin Setup (10 minutes)

1. Log into your TRMNL account
2. Navigate to Plugins → Create New Plugin
3. Choose "Private Plugin" and webhook strategy
4. Copy the template from `local-service/trmnl-plugin-template.html` (or `trmnl-plugin/plugin.html`) into the TRMNL plugin editor
5. Save the plugin
6. **Important**: Copy your plugin's webhook URL (you'll need this for the local service or GCP service)

**Key Outputs:**
- TRMNL Private Plugin webhook URL

### Step 3: Workflow Automation Setup

**Choose one option:**

#### Option A: Local Service (Recommended) – See [SETUP_LOCAL.md](./SETUP_LOCAL.md)
- Install dependencies in `local-service/`
- Configure `.env` with Gmail credentials and TRMNL webhook URL
- Run `node index.js` (or schedule with cron/launchd)
- Full control, zero cloud cost

#### Option B: GCP Service – See [SETUP_GCP_SERVICE.md](./SETUP_GCP_SERVICE.md)
- Deploy Node.js service to Cloud Run
- Set up Cloud Scheduler for daily execution
- Full control, low monthly cost

### Step 4: Configure Looker (10 minutes)

1. Follow the detailed guide: [`docs/looker-setup.md`](./docs/looker-setup.md)
2. Navigate to your Looker report
3. Click "Schedule"
4. Configure:
   - **Recipients**: Your Gmail address from Step 1
   - **Format**: PDF (recommended; service parses PDF tables)
   - **Frequency**: Daily, weekly, etc.
   - **Subject**: Descriptive title (will appear on TRMNL)
5. Send a test email
6. Verify it is processed by your local service or GCP service

**Key Outputs:**
- Active Looker schedule
- Verified email delivery

## Verification Checklist

After completing all steps, verify:

- [ ] Test email from Looker arrives in Gmail
- [ ] Local service (or GCP service) processes the email
- [ ] PDF is parsed and data is extracted
- [ ] TRMNL webhook receives the payload
- [ ] TRMNL display updates with report data
- [ ] Scheduled Looker emails trigger the pipeline automatically

## Troubleshooting

### Email Not Detected

- Check Gmail query matches your Looker sender address (e.g. `from:looker-studio-noreply@google.com`)
- Verify emails are in the inbox (or label) the service is querying
- Check service logs for errors
- For local service: ensure OAuth2 token is valid (`gmail-token.json`)

### Data Not Appearing on TRMNL

- Verify TRMNL webhook URL is correct in `.env`
- Check service logs for webhook request/response
- Verify TRMNL Private Plugin markup is saved and matches payload shape
- Use `--preview` to save JSON/PNG locally and inspect payload

### Parsing Errors

- Ensure Looker sends PDF (or CSV) attachment
- Check attachment is included in the email
- Run with `--preview` and inspect extracted data
- Test with sample CSV using `scripts/parse-csv.js`

### Gmail API Errors

- Verify Gmail API is enabled in Google Cloud Console
- Check OAuth2 credentials (or service account) are correct
- Ensure proper scopes are granted
- Re-run OAuth2 flow if token expired

## Next Steps

Once everything is working:

1. **Customize the TRMNL Plugin**: Edit the template to match your brand/style
2. **Add More Reports**: Configure additional Looker schedules
3. **Optimize Display**: Adjust data formatting for your e-ink display size
4. **Set Up Monitoring**: Add logging, alerts, or health checks as needed
5. **Document Your Setup**: Note any customizations for future reference

## Support Resources

- [TRMNL Documentation](https://trmnl.co/docs)
- [Gmail API Documentation](https://developers.google.com/gmail/api)
- [Looker Scheduling Docs](https://docs.cloud.google.com/looker/docs/scheduling)

## Getting Help

If you encounter issues:

1. Check the troubleshooting section above
2. Review service logs (local or GCP)
3. Test individual components (Gmail API, TRMNL webhook)
4. Review the detailed guides in each component's README

---

**Ready to start?** Begin with [Step 1: Gmail API Setup](./scripts/gmail-setup.md)
