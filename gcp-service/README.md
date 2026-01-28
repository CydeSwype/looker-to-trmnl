# GCP Service: Looker to TRMNL Pipeline

This is a Node.js service designed to run on Google Cloud Platform (Cloud Run) that processes Looker report emails and sends them to your TRMNL e-ink display.

## Architecture

- **Service**: Express.js HTTP server
- **Trigger**: Cloud Scheduler (cron job) calls HTTP endpoint daily
- **Processing**: Polls Gmail API, parses emails, transforms data, sends to TRMNL
- **Deployment**: Cloud Run (containerized)

## Setup

### 1. Prerequisites

- Google Cloud Project with billing enabled
- Gmail API enabled
- Service Account or OAuth2 credentials for Gmail API
- TRMNL account with plugin webhook URL
- Node.js 18+ (for local development)
- Docker (for building container)

### 2. Local Development

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your credentials
# GMAIL_CREDENTIALS, TRMNL_WEBHOOK_URL, etc.

# Run locally
npm start

# Or with auto-reload
npm run dev
```

### 3. Test Locally

```bash
# Health check
curl http://localhost:8080/health

# Manual trigger
curl -X POST http://localhost:8080/process
```

### 4. Deploy to Cloud Run

```bash
# Set your GCP project
export PROJECT_ID=your-project-id
gcloud config set project $PROJECT_ID

# Build and deploy
gcloud run deploy looker-to-trmnl \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GMAIL_CREDENTIALS="$(cat service-account.json | jq -c)", \
                 GMAIL_USER_EMAIL="looker-reports@yourdomain.com", \
                 GMAIL_QUERY="from:looker@yourdomain.com", \
                 TRMNL_WEBHOOK_URL="https://your-trmnl-webhook-url"
```

### 5. Set Up Cloud Scheduler

```bash
# Get your Cloud Run service URL
SERVICE_URL=$(gcloud run services describe looker-to-trmnl --region us-central1 --format 'value(status.url)')

# Create daily cron job (runs at 9 AM UTC)
gcloud scheduler jobs create http looker-to-trmnl-daily \
  --schedule="0 9 * * *" \
  --uri="$SERVICE_URL/cron" \
  --http-method=GET \
  --time-zone="America/Los_Angeles" \
  --location=us-central1
```

## Environment Variables

See `.env.example` for all configuration options.

**Required:**
- `GMAIL_CREDENTIALS`: Service account JSON (as string) or OAuth2 credentials
- `TRMNL_WEBHOOK_URL`: Your TRMNL plugin webhook URL

**Optional:**
- `GMAIL_USER_EMAIL`: Email address to check (default: looker-reports@yourdomain.com)
- `GMAIL_QUERY`: Gmail search query (default: from:looker@yourdomain.com)
- `GMAIL_LABEL`: Gmail label to search (default: INBOX)
- `TRMNL_API_KEY`: Optional API key for TRMNL webhook
- `MAX_EMAILS_PER_RUN`: Max emails to process per execution (default: 10)

## Endpoints

- `GET /health` - Health check
- `POST /process` - Manually trigger email processing
- `GET /cron` - Endpoint for Cloud Scheduler (same as /process)

## Cost Estimate

For daily execution:
- **Cloud Run**: ~$0.40/month (2 vCPU-seconds per day × $0.00002400/vCPU-second)
- **Gmail API**: Free (within quota limits)
- **Cloud Scheduler**: Free (first 3 jobs)

**Total: ~$0.40/month**

## Monitoring

- View logs: `gcloud run services logs read looker-to-trmnl --region us-central1`
- Check executions: Cloud Scheduler → Job executions
- Monitor errors: Cloud Run → Logs

## Troubleshooting

### Service won't start
- Check environment variables are set correctly
- Verify Gmail API credentials are valid
- Check Cloud Run logs for errors

### Emails not found
- Verify Gmail query matches your Looker sender
- Check emails are in the specified label
- Ensure service account has Gmail API access

### TRMNL not receiving data
- Verify webhook URL is correct
- Check TRMNL plugin is active
- Review service logs for HTTP errors

## Security

- Service account credentials stored as environment variables (encrypted by Cloud Run)
- No authentication required for cron endpoint (can add if needed)
- Gmail API uses OAuth2/service account authentication
- All data processing happens within GCP

## Next Steps

1. Deploy service to Cloud Run
2. Set up Cloud Scheduler
3. Test with a sample Looker email
4. Monitor first few executions
5. Adjust schedule/query as needed
