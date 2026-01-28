# Architecture: Looker to TRMNL Pipeline

## Overview

Simple, local service that processes Looker report emails and sends PNG images directly to TRMNL e-ink displays.

## Architecture Diagram

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
│  API        │
│ (G Suite)   │
└──────┬──────┘
       │
       │ (Polling via Gmail API)
       ▼
┌─────────────┐
│ Local       │
│ Service     │
│ - Parse     │
│   PDF/CSV   │
│ - Generate  │
│   PNG/JSON  │
└──────┬──────┘
       │
       │ (POST PNG image)
       ▼
┌─────────────┐
│   TRMNL     │
│ Image API   │
│  (Webhook)  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  TRMNL      │
│  E-ink      │
│  Display    │
└─────────────┘
```

## Components

### 1. Looker Email Scheduling
- **Purpose**: Automatically send reports via email on a schedule
- **Format**: CSV attachment (recommended)
- **Frequency**: Daily (configurable)
- **Target**: Gmail address (your inbox or a dedicated address)

### 2. Gmail API
- **Purpose**: Receive and access Looker report emails
- **Method**: Service Account authentication
- **Access**: Read emails, download attachments
- **Security**: All processing within G Suite infrastructure

### 3. Local Service
- **Location**: Runs on your machine (e.g. Mac, Linux, always-on PC)
- **Function**:
  - Polls Gmail API for new emails
  - Parses CSV attachments
  - Generates PNG images from data
  - POSTs PNG to TRMNL image webhook
- **Scheduling**: Cron or launchd (macOS)
- **Dependencies**: Node.js, canvas library

### 4. TRMNL Image API
- **Purpose**: Receive PNG images and display on e-ink
- **Method**: POST multipart/form-data with image
- **Format**: PNG image (800x600 default, configurable)

## Data Flow

1. **Looker** sends scheduled email with CSV attachment
2. **Gmail** receives email at configured address
3. **Local script** (scheduled daily):
   - Polls Gmail API for new emails
   - Downloads CSV attachment
   - Parses CSV data
   - Generates PNG image
   - POSTs PNG to TRMNL image webhook
4. **TRMNL** displays image on e-ink display

## Advantages

✅ **Simple**: No third-party workflow or cloud services required
✅ **Cost-effective**: Free (runs locally)
✅ **Control**: Full control over code and execution
✅ **Privacy**: All processing happens locally
✅ **Reliable**: No external dependencies beyond Gmail API

## Technology Stack

- **Node.js**: Runtime environment
- **googleapis**: Gmail API client
- **canvas**: PNG image generation
- **axios**: HTTP client for TRMNL API
- **form-data**: Multipart form data for image upload

## Security

- Service account credentials stored locally
- Gmail API uses OAuth2/service account authentication
- No data leaves local machine except:
  - Gmail API calls (to Google)
  - PNG image POST (to TRMNL)
- All email processing happens locally

## Scheduling

The service can be scheduled using:
- **Cron**: Traditional Unix scheduler
- **launchd**: macOS native scheduler (recommended)

Both support daily execution at specified times.

## Next Steps

See `SETUP_LOCAL.md` for complete setup instructions.
