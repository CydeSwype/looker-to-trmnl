# Architecture Options: Local Service vs GCP Service

## Comparison

### Option A: Local Service (Recommended)
**Pros:**
- ✅ No cloud cost; runs on your machine (e.g. Mac mini)
- ✅ Full control over code and execution
- ✅ Simple setup: clone repo, install deps, configure `.env`, run
- ✅ No vendor lock-in
- ✅ Easy to debug and iterate (e.g. `--preview`)

**Cons:**
- ⚠️ Machine must be on and connected when you want to process emails
- ⚠️ You manage scheduling (cron, launchd)

**Cost:** Free

### Option B: GCP Service
**Pros:**
- ✅ Full control over code and execution
- ✅ Cost-effective (Cloud Run: ~$0.40/month for daily polling)
- ✅ No local machine required; runs in the cloud
- ✅ Can use Cloud Scheduler for cron-style triggers

**Cons:**
- ⚠️ Requires GCP project and deployment
- ⚠️ Slightly more initial setup

**Cost:** Cloud Run: ~$0.40/month (for daily polling), or free tier eligible

## Recommendation: Local Service

For most users, running the local service on a machine that’s already on (e.g. Mac mini) is the simplest and cheapest option. Use GCP if you prefer a serverless, always-available setup.

## Architecture: Local Service

```
┌─────────────┐
│   Looker   │
│  Scheduled │
│    Email   │
└──────┬─────┘
       │
       │ (Email with PDF attachment)
       ▼
┌─────────────┐
│   Gmail     │
│  (inbox)    │
└──────┬─────┘
       │
       │ (Gmail API)
       ▼
┌─────────────┐
│ Local       │
│ Service     │
│ (Node.js)   │
└──────┬─────┘
       │
       │ (JSON to TRMNL Private Plugin webhook)
       ▼
┌─────────────┐
│   TRMNL     │
│   Plugin    │
└─────────────┘
```

## Implementation Options

### Option 1: Local Service (Recommended)
- **Deployment**: Run `node index.js` (or schedule with cron/launchd)
- **Trigger**: Cron/launchd or manual run
- **Cost**: Free
- **Best for**: Single machine always on (e.g. Mac mini)

### Option 2: GCP Cloud Run
- **Deployment**: Containerized Node.js service
- **Trigger**: Cloud Scheduler (cron) → HTTP endpoint
- **Cost**: ~$0.40/month for daily execution
- **Scaling**: Automatic, scales to zero when not in use

### Option 3: GCP Cloud Functions
- **Deployment**: Serverless function
- **Trigger**: Cloud Scheduler → HTTP trigger
- **Cost**: Free tier eligible
- **Limitations**: 9 minute timeout, less flexibility

**Recommendation:** Start with the local service; move to GCP if you need serverless or don’t want to keep a machine running.

## Next Steps

1. Review the local service code in `local-service/`
2. Follow `SETUP_LOCAL.md` (or `SETUP_GCP_SERVICE.md` for GCP)
3. Configure Gmail API and TRMNL webhook URL
4. Run the service (or deploy and schedule on GCP)
