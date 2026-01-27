# Initial Setup Checklist

This document outlines the initial setup steps for the Looker → TRMNL pipeline. Steps marked with 👤 require your action (account setup, credentials, etc.). Steps marked with 🤖 can be automated or I can help prepare.

## Phase 1: Account & Service Setup (👤 You Need to Do)

### 1.1 TRMNL Account Setup
- [ ] Create TRMNL account at [trmnl.co](https://trmnl.co)
- [ ] Set up your e-ink display device
- [ ] Note your TRMNL account details
- [ ] **Action Required**: Once you have your TRMNL account, I'll help you deploy the plugin

### 1.2 Pipedream Account Setup
- [ ] Create Pipedream account at [pipedream.com](https://pipedream.com) (free tier works)
- [ ] Note your Pipedream account email
- [ ] **Action Required**: Once you have your account, I'll help configure the workflow

### 1.3 Google Cloud / Gmail API Setup
- [ ] Access Google Cloud Console (requires G Suite admin or project access)
- [ ] Create a new Google Cloud project (or use existing)
- [ ] Enable Gmail API in the project
- [ ] Create OAuth2 credentials or Service Account
  - **Option A**: OAuth2 Client ID (for user-based access)
  - **Option B**: Service Account (recommended for automated workflows)
- [ ] **Action Required**: Share the credentials with me (securely) so I can help configure Pipedream
- [ ] **Reference**: See `scripts/gmail-setup.md` for detailed steps

### 1.4 G Suite Email Address
- [ ] Create dedicated email address for Looker reports (e.g., `looker-reports@yourdomain.com`)
- [ ] Or identify existing email address to use
- [ ] Set up Gmail filters (optional but recommended) to label Looker emails
- [ ] **Action Required**: Share the email address so I can update configuration files

### 1.5 Looker Access
- [ ] Verify you have admin access or permission to create scheduled deliveries
- [ ] Identify the Look or Dashboard you want to schedule
- [ ] **Action Required**: Share the report details so I can help configure the schedule

## Phase 2: Code Review & Preparation (🤖 I Can Help)

### 2.1 Review Existing Code
- [x] ✅ TRMNL plugin HTML template (`trmnl-plugin/plugin.html`)
- [x] ✅ Pipedream workflow code (`pipedream-workflow/parse-email.js`, `transform-data.js`)
- [x] ✅ Utility scripts (`scripts/parse-csv.js`)
- [x] ✅ Documentation files

### 2.2 Configuration Files to Update
Once you provide the information above, I'll help update:
- [ ] Pipedream workflow configuration with your Gmail credentials
- [ ] TRMNL plugin webhook URL (after you create the plugin)
- [ ] Email query filters in Pipedream workflow
- [ ] Looker configuration guide with your specific details

### 2.3 Testing Preparation
- [ ] Create sample CSV file for testing (if you have one)
- [ ] Test CSV parsing locally using `scripts/parse-csv.js`
- [ ] Verify TRMNL payload format

## Phase 3: Deployment (👤 You + 🤖 Me)

### 3.1 TRMNL Plugin Deployment
- [ ] Log into TRMNL account
- [ ] Create new private plugin
- [ ] Copy `trmnl-plugin/plugin.html` into TRMNL editor
- [ ] Save plugin and copy webhook URL
- [ ] **Action Required**: Share webhook URL so I can update Pipedream workflow

### 3.2 Pipedream Workflow Deployment
- [ ] Create new Pipedream workflow
- [ ] Add Gmail trigger (I'll provide exact configuration)
- [ ] Add email parsing step (code already prepared)
- [ ] Add data transformation step (code already prepared)
- [ ] Add TRMNL webhook step (I'll configure with your URL)
- [ ] Test workflow with sample email

### 3.3 Looker Configuration
- [ ] Navigate to your Looker report
- [ ] Configure scheduled email delivery
- [ ] Set target email address (from Step 1.4)
- [ ] Configure format (CSV recommended)
- [ ] Set schedule frequency
- [ ] Send test email

## Information I Need From You

To proceed with the setup, please provide:

1. **TRMNL Account Status**
   - [ ] Account created? (Yes/No)
   - [ ] Webhook URL (if plugin already created)

2. **Pipedream Account Status**
   - [ ] Account created? (Yes/No)
   - [ ] Account email/username

3. **Gmail API Credentials**
   - [ ] Google Cloud project created? (Yes/No)
   - [ ] Gmail API enabled? (Yes/No)
   - [ ] OAuth2 Client ID & Secret OR Service Account JSON
   - [ ] Preferred authentication method (OAuth2 vs Service Account)

4. **Email Configuration**
   - [ ] Target email address for Looker reports
   - [ ] Looker sender email address (to filter emails)

5. **Looker Report Details**
   - [ ] Report name/ID
   - [ ] Preferred format (CSV/PDF)
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
- I'll help you configure them in Pipedream securely

## Questions to Resolve

Before final deployment, we should confirm:

1. **Report Format**: CSV (recommended) or PDF?
2. **Update Frequency**: How often should reports update? (Daily, hourly, etc.)
3. **Display Size**: What's your TRMNL display resolution? (affects layout)
4. **Multiple Reports**: Will you have multiple reports or just one?
5. **Data Volume**: How many rows/columns in typical report? (affects parsing)

---

**Ready to start?** Begin with Phase 1 account setup, then share the information above and I'll help with the rest!
