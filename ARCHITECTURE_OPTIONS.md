# Architecture Options: Pipedream vs GCP Service

## Comparison

### Option A: Pipedream (Original Plan)
**Pros:**
- ✅ No infrastructure management
- ✅ Built-in Gmail integration
- ✅ Visual workflow editor
- ✅ Easy to set up initially

**Cons:**
- ❌ Pricing can be limiting (free tier: 100 invocations/day, 2 workflows)
- ❌ Less control over execution
- ❌ Vendor lock-in
- ❌ Limited customization

**Cost:** Free tier limited, then $19/month+ for production use

### Option B: GCP Service (Recommended for Your Use Case)
**Pros:**
- ✅ Full control over code and execution
- ✅ Cost-effective (Cloud Run: ~$0.40/month for daily polling)
- ✅ Uses existing GCP infrastructure
- ✅ No vendor lock-in
- ✅ Can customize exactly to your needs
- ✅ Better for long-term maintenance

**Cons:**
- ⚠️ Requires some infrastructure setup
- ⚠️ Need to manage deployment
- ⚠️ Slightly more initial setup

**Cost:** Cloud Run: ~$0.40/month (for daily polling), or free tier eligible

## Recommendation: GCP Service

Given your requirements:
- Daily frequency (low volume)
- Simple table/chart data
- Existing GCP resources
- Cost concerns

**A GCP Cloud Run service is the better choice.**

## Architecture: GCP Service

```
┌─────────────┐
│   Looker    │
│  Scheduled  │
│    Email    │
└──────┬──────┘
       │
       │ (Email with CSV attachment)
       ▼
┌─────────────┐
│  Gmail      │
│  (G Suite)  │
└──────┬──────┘
       │
       │ (Gmail API Polling or Pub/Sub)
       ▼
┌─────────────┐
│ Cloud Run   │
│  Service    │
│ (Node.js)   │
└──────┬──────┘
       │
       │ (Transformed JSON)
       ▼
┌─────────────┐
│   TRMNL     │
│   Plugin    │
└─────────────┘
```

## Implementation Options

### Option 1: Cloud Run (Recommended)
- **Deployment**: Containerized Node.js service
- **Trigger**: Cloud Scheduler (cron job) → HTTP endpoint
- **Cost**: ~$0.40/month for daily execution
- **Scaling**: Automatic, scales to zero when not in use

### Option 2: Cloud Functions
- **Deployment**: Serverless function
- **Trigger**: Cloud Scheduler → HTTP trigger
- **Cost**: Free tier eligible, then ~$0.40/month
- **Limitations**: 9 minute timeout, less flexibility

### Option 3: App Engine
- **Deployment**: Managed platform
- **Trigger**: Cron job or HTTP endpoint
- **Cost**: Free tier eligible
- **More**: Full platform, more setup

**Recommendation: Cloud Run** - Best balance of flexibility, cost, and simplicity.

## Next Steps

1. Review the GCP service code I'll create
2. Choose deployment option (Cloud Run recommended)
3. Set up GCP project and credentials
4. Deploy the service
5. Configure Cloud Scheduler for daily execution
