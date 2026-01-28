# Next Steps: Initial Setup

Based on your requirements, here's what we've prepared and what to do next.

## What's Ready

✅ **Code Complete**:
- TRMNL plugin HTML template (`trmnl-plugin/plugin.html`)
- GCP service code (`gcp-service/`) - Full Node.js service ready to deploy
- Local service code (`local-service/`)
- Utility scripts for testing
- All documentation

✅ **Architecture Decision**:
- **Recommended**: GCP Cloud Run service (~$0.40/month)
- **Alternative**: GCP Cloud Run (if you prefer serverless)

## Your Answers Summary

Based on your requirements:
- ✅ Format: Any viewable on TRMNL (CSV recommended)
- ✅ Frequency: Daily
- ✅ Display: Standard TRMNL resolution
- ✅ Reports: Start with single report, can add to playlist later
- ✅ Data: Simple table/chart per playlist item

## Step-by-Step Setup Process

### Phase 1: Account Setup (You Do)

1. **Gmail API Setup** (15 min)
   - Create Google Cloud project
   - Enable Gmail API
   - Create Service Account or OAuth2 credentials
   - Create dedicated email address for Looker reports
   - **Guide**: `scripts/gmail-setup.md`

2. **TRMNL Account** (10 min)
   - Create TRMNL account
   - Set up e-ink display
   - Create plugin (copy `trmnl-plugin/plugin.html`)
   - Get webhook URL
   - **Guide**: `trmnl-plugin/README.md`

### Phase 2: Service Deployment (I Can Help)

3. **GCP Service Deployment** (20 min)
   - Deploy to Cloud Run
   - Configure environment variables
   - Set up Cloud Scheduler
   - Test end-to-end
   - **Guide**: `SETUP_GCP_SERVICE.md`

### Phase 3: Looker Configuration (You Do)

4. **Looker Setup** (10 min)
   - Configure scheduled email delivery
   - Set target email address
   - Choose CSV format
   - Set daily schedule
   - **Guide**: `docs/looker-setup.md`

## Checklist Before Deploying

- [ ] Google Cloud project created, Gmail API enabled
- [ ] Gmail credentials (Service Account JSON or OAuth2) saved
- [ ] TRMNL account created, Private Plugin (or Image webhook) set up, webhook URL copied
- [ ] GCP project ID and preferred region (e.g. us-central1) chosen
- [ ] Looker report scheduled to email the address you will use for `GMAIL_USER_EMAIL`

## Quick Start Commands

Once you have credentials, here are the key commands:

### Test Locally (GCP Service)
```bash
cd gcp-service
npm install
cp .env.example .env
# Edit .env with your credentials
npm start
```

### Deploy to Cloud Run
```bash
cd gcp-service
gcloud run deploy looker-to-trmnl \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GMAIL_CREDENTIALS="...",TRMNL_WEBHOOK_URL="..."
```

### Set Up Daily Schedule
```bash
gcloud scheduler jobs create http looker-to-trmnl-daily \
  --schedule="0 9 * * *" \
  --uri="YOUR_SERVICE_URL/cron" \
  --http-method=GET
```

## Documentation Reference

- **Architecture Options**: `ARCHITECTURE_OPTIONS.md` - Compare local vs GCP
- **GCP Setup Guide**: `SETUP_GCP_SERVICE.md` - Complete step-by-step
- **Gmail API Setup**: `scripts/gmail-setup.md` - Detailed Gmail API guide
- **TRMNL Plugin**: `trmnl-plugin/README.md` - Plugin setup
- **Looker Setup**: `docs/looker-setup.md` - Looker configuration

## Questions?

If you have questions about:
- **Gmail API setup**: See `scripts/gmail-setup.md`
- **GCP deployment**: See `SETUP_GCP_SERVICE.md`
- **TRMNL plugin**: See `trmnl-plugin/README.md`
- **Architecture**: See `ARCHITECTURE_OPTIONS.md`

---

**Ready to start?** Begin with [scripts/gmail-setup.md](scripts/gmail-setup.md), then follow [SETUP_GCP_SERVICE.md](SETUP_GCP_SERVICE.md) or [SETUP_LOCAL.md](SETUP_LOCAL.md).
