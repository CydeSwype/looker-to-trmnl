# Initial Setup Checklist

This document outlines the initial setup steps for the Looker → TRMNL pipeline. Steps marked with 👤 require your action (account setup, credentials, etc.). Steps marked with 🤖 can be automated or I can help prepare.

## Phase 1: Account & Service Setup (👤 You Need to Do)

### 1.1 TRMNL Account Setup
- [ ] Create TRMNL account at [trmnl.co](https://trmnl.co)
- [ ] Set up your e-ink display device
- [ ] Note your TRMNL account details
- [ ] **Action Required**: Once you have your TRMNL account, I'll help you deploy the plugin

### 1.2 Google Cloud / Gmail API Setup
- [ ] Access Google Cloud Console (requires project access)
- [ ] Create a new Google Cloud project (or use existing)
- [ ] Enable Gmail API in the project
- [ ] Create OAuth2 credentials (for user inbox) or Service Account
  - **Option A**: OAuth2 Client ID (recommended for reading a user's Gmail)
  - **Option B**: Service Account (for domain-wide delegation, requires admin)
- [ ] **Action Required**: Share the credentials with me (securely) so I can help configure the local service (or GCP service)
- [ ] **Reference**: See `scripts/gmail-setup.md` for detailed steps

### 1.3 Gmail / Email Address
- [ ] Use the Gmail address that will receive Looker reports (e.g. your inbox or a dedicated address)
- [ ] Set up Gmail filters (optional but recommended) to label Looker emails
- [ ] **Action Required**: Share the email address so I can update configuration files

### 1.4 Looker Access
- [ ] Verify you have admin access or permission to create scheduled deliveries
- [ ] Identify the Look or Dashboard you want to schedule
- [ ] **Action Required**: Share the report details so I can help configure the schedule

## Phase 2: Code Review & Preparation (🤖 I Can Help)

### 2.1 Review Existing Code
- [x] ✅ TRMNL plugin template (`trmnl-plugin/plugin.html`, `local-service/trmnl-plugin-template.html`)
- [x] ✅ Local service code (`local-service/`)
- [x] ✅ Utility scripts (`scripts/parse-csv.js`)
- [x] ✅ Documentation files

### 2.2 Configuration Files to Update
Once you provide the information above, I'll help update:
- [ ] Local service `.env` (or GCP env vars) with Gmail credentials and TRMNL webhook URL
- [ ] TRMNL Private Plugin markup (after you create the plugin)
- [ ] Email query filters (e.g. `from:looker-studio-noreply@google.com`)
- [ ] Looker configuration guide with your specific details

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
- [ ] **Action Required**: Share webhook URL so I can update the local service (or GCP) config

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

## Information I Need From You

To proceed with the setup, please provide:

1. **TRMNL Account Status**
   - [ ] Account created? (Yes/No)
   - [ ] Webhook URL (if plugin already created)

2. **Gmail API Credentials**
   - [ ] Google Cloud project created? (Yes/No)
   - [ ] Gmail API enabled? (Yes/No)
   - [ ] OAuth2 Client ID & Secret OR Service Account JSON
   - [ ] Preferred authentication method (OAuth2 vs Service Account)

3. **Email Configuration**
   - [ ] Target email address for Looker reports
   - [ ] Looker sender email address (e.g. `looker-studio-noreply@google.com` for filtering)

4. **Looker Report Details**
   - [ ] Report name/ID
   - [ ] Preferred format (PDF/CSV)
   - [ ] Desired schedule frequency

## Next Steps

Once you've completed the account setup steps (Phase 1), share the information above and I'll:

1. **Update configuration files** with your specific details
2. **Prepare deployment instructions** tailored to your setup
3. **Help test the pipeline** step by step
4. **Troubleshoot any issues** that arise

## Security Notes

⚠️ **Important**: When sharing credentials:
- Never commit credentials to git
- Share OAuth2 Client ID/Secret or Service Account JSON securely
- Use secure channels (not in plain text in chat if possible)
- Credentials are stored in `.env` (local) or platform config (GCP) and never committed

## Questions to Resolve

Before final deployment, we should confirm:

1. **Report Format**: PDF (recommended; parsed automatically) or CSV?
2. **Update Frequency**: How often should reports update? (Daily, hourly, etc.)
3. **Display Size**: What's your TRMNL display resolution? (affects layout)
4. **Multiple Reports**: Will you have multiple reports or just one?
5. **Data Volume**: How many rows/columns in typical report? (affects parsing)

---

**Ready to start?** Begin with Phase 1 account setup, then share the information above and I'll help with the rest!
