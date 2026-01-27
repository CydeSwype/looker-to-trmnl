# Looker to TRMNL Data Pipeline - Planning Document

## Executive Summary

This document outlines the architecture and implementation plan for a data pipeline that automatically delivers Looker reports to a TRMNL e-ink display via scheduled email delivery. The system will be simple, repeatable, and require minimal ongoing maintenance.

## Goals

1. **Automated Delivery**: Schedule Looker reports to be emailed automatically
2. **Seamless Integration**: Transform email content into TRMNL-compatible format
3. **Reliability**: Ensure reports appear on the e-ink display without manual intervention
4. **Simplicity**: Keep the system straightforward and maintainable

## Architecture Overview

```
┌─────────────┐
│   Looker    │
│  Scheduled  │
│    Email    │
└──────┬──────┘
       │
       │ (Email with report data)
       ▼
┌─────────────┐
│  Gmail      │
│  API        │
│ (G Suite)   │
└──────┬──────┘
       │
       │ (Webhook trigger)
       ▼
┌─────────────┐
│ Workflow    │
│ Automation  │
│ (Pipedream/ │
│  Zapier)    │
└──────┬──────┘
       │
       │ (Transformed data)
       ▼
┌─────────────┐
│   TRMNL     │
│   Plugin    │
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
- **Configuration**: 
  - Set up scheduled delivery in Looker
  - Configure email format (PDF, CSV, or visualization)
  - Target email address (inbound email service)
- **Reference**: [Looker Scheduling Documentation](https://docs.cloud.google.com/looker/docs/scheduling)

### 2. Email Receiving Service
- **Primary Choice: Gmail API**
  - **Security Advantage**: Already within G Suite security perimeter - no additional vendor risk
  - **Compliance**: Data stays within existing Google Workspace infrastructure
  - **Cost**: No additional service fees (uses existing G Suite)
  - **Implementation**: Uses Gmail API with OAuth2 authentication
  - **Trigger Method**: Gmail Push Notifications or polling mechanism
- **Alternative Options** (if Gmail API doesn't meet requirements):
  - **Postmark**: Purpose-built inbound email handling with webhook support (adds third-party vendor)
  - **SendGrid Inbound Parse**: Email parsing service (adds third-party vendor)
- **Requirements**:
  - Receive emails at a dedicated G Suite email address
  - Trigger workflow when emails arrive (via push notifications or polling)
  - Extract email content and attachments

### 3. Workflow Automation Layer
- **Options**:
  - **Pipedream** (Recommended): Low-code workflow automation with built-in integrations
  - **Zapier**: Similar workflow automation platform
  - **Custom Service**: Node.js/Python service with email parsing
- **Responsibilities**:
  - Parse incoming email content
  - Extract report data (from attachments or email body)
  - Transform data into TRMNL webhook format
  - Send webhook to TRMNL plugin

### 4. TRMNL Plugin
- **Purpose**: Custom plugin that receives webhook data and renders content
- **Technology**: 
  - HTML/CSS for layout
  - Liquid templating for dynamic content
  - Webhook endpoint for receiving data
- **Reference**: [TRMNL Plugin Documentation](https://trmnl.co/docs)

## Data Flow

### Step 1: Looker Email Delivery
1. Looker executes scheduled report
2. Report is generated in configured format (PDF, CSV, or visualization)
3. Email is sent to configured inbound email address

### Step 2: Email Reception
1. Gmail receives the email at the configured G Suite address
2. Gmail Push Notification (or polling) detects new email
3. Workflow automation service is triggered via Gmail API
4. Email content and attachments are retrieved and parsed via Gmail API

### Step 3: Data Transformation
1. Workflow automation receives webhook payload
2. Email content/attachments are extracted
3. Data is transformed into TRMNL-compatible format:
   - Extract key metrics/visualizations
   - Format data for e-ink display (considering monochrome limitations)
   - Structure data for Liquid templating

### Step 4: TRMNL Update
1. Transformed data is sent to TRMNL plugin webhook
2. Plugin renders content using HTML/CSS/Liquid
3. E-ink display updates with new report data

## Implementation Phases

### Phase 1: Setup and Configuration
- [ ] Create TRMNL account and set up e-ink display
- [ ] Set up Gmail API access (OAuth2 credentials in Google Cloud Console)
- [ ] Create dedicated G Suite email address for Looker reports (e.g., `looker-reports@yourdomain.com`)
- [ ] Configure Gmail Push Notifications or polling mechanism
- [ ] Set up workflow automation account (Pipedream recommended - has Gmail API integration)

### Phase 2: TRMNL Plugin Development
- [ ] Create TRMNL plugin with webhook endpoint
- [ ] Design HTML/CSS layout for report display
- [ ] Implement Liquid templates for dynamic content
- [ ] Test plugin rendering with sample data

### Phase 3: Workflow Automation
- [ ] Create Pipedream workflow (or equivalent)
- [ ] Configure Gmail API trigger (Push Notifications or polling)
- [ ] Set up OAuth2 authentication for Gmail API
- [ ] Implement email parsing logic (using Gmail API to fetch email content)
- [ ] Extract report data from email/attachments
- [ ] Transform data to TRMNL format
- [ ] Configure webhook to TRMNL plugin

### Phase 4: Looker Integration
- [ ] Configure Looker scheduled email delivery
- [ ] Set target email address (inbound service)
- [ ] Configure report format (PDF, CSV, or visualization)
- [ ] Set schedule (daily, weekly, etc.)
- [ ] Test end-to-end flow

### Phase 5: Testing and Refinement
- [ ] Test complete pipeline with sample Looker report
- [ ] Verify data transformation accuracy
- [ ] Optimize e-ink display formatting
- [ ] Handle error cases and edge cases
- [ ] Document maintenance procedures

## Technical Considerations

### Email Format Selection
- **PDF**: Good for visualizations, but requires parsing/extraction
- **CSV**: Easy to parse, but loses visual formatting
- **Visualization**: May require image extraction and processing
- **Recommendation**: Start with CSV for simplicity, evolve to PDF if needed

### Data Transformation Challenges
- **E-ink Limitations**: Monochrome display, limited resolution
- **Content Sizing**: Reports may need to be simplified or paginated
- **Refresh Rate**: E-ink displays update slowly; consider update frequency

### Error Handling
- Email delivery failures
- Webhook timeouts
- Data parsing errors
- TRMNL API failures
- Implement retry logic and error notifications

### Security
- **Gmail API Security**: OAuth2 authentication with service account or user credentials
- **Data Residency**: Data remains within G Suite infrastructure (no third-party email vendor)
- **Access Control**: Use service account with minimal required Gmail API scopes
- **Secure Webhooks**: Authentication tokens for TRMNL plugin endpoints
- **TRMNL Plugin**: Access control and authentication for webhook endpoints
- **Data Privacy**: All email processing happens within existing G Suite security perimeter

## Email Service Decision: Gmail API vs. Postmark

### Why Gmail API is Preferred (for G Suite organizations)

**Security & Compliance Benefits:**
- ✅ **No Additional Vendor Risk**: Data stays within existing G Suite infrastructure
- ✅ **Compliance Alignment**: Leverages existing Google Workspace security controls
- ✅ **Data Residency**: No third-party email service handling company data
- ✅ **Audit Trail**: All access logged within existing G Suite audit logs

**Practical Benefits:**
- ✅ **No Additional Cost**: Uses existing G Suite subscription
- ✅ **Familiar Infrastructure**: IT/Security teams already manage G Suite
- ✅ **Simplified Vendor Management**: One less vendor relationship to manage

**Trade-offs:**
- ⚠️ **Slightly More Complex Setup**: Requires OAuth2 configuration and Gmail API setup
- ⚠️ **Trigger Mechanism**: Uses Gmail Push Notifications (requires pub/sub) or polling instead of direct webhooks
- ⚠️ **Implementation**: May require more custom code compared to Postmark's purpose-built inbound handling

**Recommendation**: For organizations already using G Suite, Gmail API is the clear choice from a security and compliance perspective. The slightly increased setup complexity is worth the reduced vendor risk.

### Reference Implementation (Postmark-based)

A working example exists using Postmark (useful for understanding the workflow pattern):
- **Repository**: https://github.com/schrockwell/trmnl-postmark-challenge
- **Components**: TRMNL plugin + Pipedream workflow
- **Use Case**: Email-to-e-ink feed for TRMNL
- **Note**: This can be adapted to use Gmail API instead of Postmark

## Alternative Approaches

### Option A: Direct API Integration (Future Enhancement)
- Looker API → Custom Service → TRMNL API
- Bypasses email layer
- More complex but potentially more reliable
- Requires Looker API access and credentials

### Option B: Cloud Storage Integration
- Looker → Cloud Storage (S3/GCS) → Trigger → TRMNL
- Uses cloud storage as intermediary
- Good for large reports
- Requires cloud storage setup

## Success Metrics

- **Reliability**: >95% successful report deliveries
- **Latency**: Reports appear on display within 5 minutes of Looker execution
- **Maintenance**: Minimal manual intervention required
- **Scalability**: Support multiple reports/displays

## Next Steps

1. Review and approve this planning document
2. Set up accounts for required services (TRMNL, Pipedream)
3. Configure Gmail API access in Google Cloud Console
4. Begin Phase 1 implementation
5. Create detailed technical specifications for each component

## Questions to Resolve

1. What format should Looker reports be in? (PDF, CSV, visualization)
2. How frequently should reports update? (Real-time, hourly, daily)
3. What data/metrics need to be displayed on the e-ink screen?
4. Are there multiple reports or a single report?
5. What is the target email address domain/format?
6. What is the TRMNL display size/resolution?

---

**Document Version**: 1.0  
**Last Updated**: 2024  
**Status**: Planning Phase
