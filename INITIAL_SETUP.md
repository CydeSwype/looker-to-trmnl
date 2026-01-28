# Initial Setup Checklist

This document outlines the initial setup steps for the Looker → TRMNL pipeline. Steps marked with 👤 require your action (account setup, credentials, etc.). Steps marked with 🤖 can be automated or I can help prepare.

## Phase 1: Account & Service Setup (👤 You Need to Do)

### 1.1 TRMNL Account Setup
- [ ] Create TRMNL account at [trmnl.co](https://trmnl.co)
- [ ] Set up your e-ink display device
- [ ] Note your TRMNL account details
- [ ] Once the plugin is created, copy its webhook URL into your local service `.env`

### 1.2 Google Cloud / Gmail API Setup
- [ ] Access [Google Cloud Console](https://console.cloud.google.com) (requires project access)
- [ ] Create a new Google Cloud project (or use existing)
- [ ] Enable Gmail API in the project
- [ ] Create OAuth2 credentials (for user inbox) or Service Account
  - **Option A**: OAuth2 Client ID (recommended for reading a user's Gmail)
  - **Option B**: Service Account (for domain-wide delegation, requires admin)
- [ ] Save the credentials JSON locally; you'll set `GMAIL_CREDENTIALS_PATH` in `local-service/.env`
- [ ] See `scripts/gmail-setup.md` for detailed steps

### 1.3 Gmail / Email Address
- [ ] Decide which Gmail address will receive Looker reports (e.g. your inbox or a dedicated address)
- [ ] Set up Gmail filters (optional but recommended) to label Looker emails
- [ ] Use this address as `GMAIL_USER_EMAIL` in `.env` and as the Looker schedule recipient

### 1.4 Looker Access
- [ ] Verify you have access to create scheduled deliveries
- [ ] Identify the Look or Dashboard you want to schedule
- [ ] Follow `docs/looker-setup.md` to configure the schedule

## Phase 2: Code Review & Preparation (🤖 I Can Help)

### 2.1 Review Existing Code
- [x] ✅ TRMNL plugin template (`trmnl-plugin/plugin.html`, `local-service/trmnl-plugin-template.html`)
- [x] ✅ Local service code (`local-service/`)
- [x] ✅ Utility scripts (`scripts/parse-csv.js`)
- [x] ✅ Documentation files

### 2.2 Configuration Files to Update
- [ ] Edit `local-service/.env` (or GCP env vars) with your Gmail credentials path and TRMNL webhook URL
- [ ] Paste the TRMNL Private Plugin markup from `local-service/trmnl-plugin-template.html` (or `trmnl-plugin/plugin.html`) into your plugin
- [ ] Set the Gmail query in `.env` (e.g. `from:looker-studio-noreply@google.com` for Looker Studio)
- [ ] Configure Looker per `docs/looker-setup.md`

### 2.3 Testing Preparation
- [ ] Create sample CSV file for testing (if you have one)
- [ ] Test CSV parsing locally using `scripts/parse-csv.js`
- [ ] Verify TRMNL payload format

## Phase 3: Deployment (👤 You + 🤖 Me)

### 3.1 TRMNL Plugin Deployment
- [ ] Log into TRMNL account
- [ ] Create new Private Plugin (webhook strategy)
- [ ] Copy `local-service/trmnl-plugin-template.html` (or `trmnl-plugin/plugin.html`) into TRMNL editor
- [ ] Save plugin and copy webhook URL
- [ ] Add the webhook URL to `local-service/.env` as `TRMNL_IMAGE_WEBHOOK_URL` (or the appropriate TRMNL env var)

### 3.2 Local Service (or GCP) Deployment
- [ ] Install dependencies in `local-service/` and configure `.env` (see `SETUP_LOCAL.md`)
- [ ] Or deploy GCP service (see `SETUP_GCP_SERVICE.md`)
- [ ] Run OAuth2 flow once if using OAuth2 (saves `gmail-token.json`)
- [ ] Test with `node index.js` or `node index.js --preview`

### 3.3 Looker Configuration
- [ ] Navigate to your Looker report
- [ ] Configure scheduled email delivery
- [ ] Set target email address (from Step 1.3)
- [ ] Configure format (PDF recommended; service parses PDF tables)
- [ ] Set schedule frequency
- [ ] Send test email

## Checklist Before Running

- [ ] TRMNL account created and Private Plugin (or Image webhook) set up; webhook URL copied
- [ ] Google Cloud project created, Gmail API enabled, credentials JSON saved
- [ ] `local-service/.env` filled in: `GMAIL_CREDENTIALS_PATH`, `GMAIL_USER_EMAIL`, `GMAIL_QUERY`, `TRMNL_IMAGE_WEBHOOK_URL`
- [ ] Looker report scheduled to email the same address as `GMAIL_USER_EMAIL`
- [ ] Run `node index.js` from `local-service/` to test; then set up cron or launchd for daily runs

## Security Notes

- Never commit credentials or `.env` to git (they are in `.gitignore`)
- Keep OAuth2 client secret or service account JSON only on your machine or in your deployment config
- The local service stores tokens (e.g. `gmail-token.json`) locally; add them to `.gitignore` if you create new token files

## Questions to Resolve

Before final deployment, we should confirm:

1. **Report Format**: PDF (recommended; parsed automatically) or CSV?
2. **Update Frequency**: How often should reports update? (Daily, hourly, etc.)
3. **Display Size**: What's your TRMNL display resolution? (affects layout)
4. **Multiple Reports**: Will you have multiple reports or just one?
5. **Data Volume**: How many rows/columns in typical report? (affects parsing)

---

**Ready to start?** Begin with Phase 1 account setup, then share the information above and I'll help with the rest!
