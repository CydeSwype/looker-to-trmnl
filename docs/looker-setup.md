# Looker Scheduled Email Configuration

This guide explains how to configure Looker to send scheduled reports via email to your G Suite address.

## Prerequisites

- Looker admin access or permission to create scheduled deliveries
- Access to the Look or Dashboard you want to schedule
- The target G Suite email address (e.g., `looker-reports@yourdomain.com`)

## Step 1: Choose Your Report

1. Navigate to the Look or Dashboard you want to schedule
2. Ensure it displays the data you want on your TRMNL display
3. Consider the format:
   - **CSV**: Best for data tables, easy to parse
   - **PDF**: Good for visualizations, requires more parsing
   - **Visualization**: Image format, may need image processing

## Step 2: Configure Scheduled Delivery

1. Click the **Schedule** button (usually in the top right)
2. Or go to the Look/Dashboard → **...** menu → **Schedule**

## Step 3: Set Up Email Delivery

1. **Delivery Method**: Select "Email"
2. **Recipients**: Enter your G Suite email address:
   - Example: `looker-reports@yourdomain.com`
   - You can add multiple recipients if needed
3. **Subject**: Customize the email subject (this will be the report title on TRMNL)
   - Example: "Daily Sales Report"
4. **Format**: Choose your preferred format:
   - **CSV** (Recommended for easy parsing)
   - **PDF** (For visualizations)
   - **Visualization** (Image format)

## Step 4: Configure Schedule

1. **Frequency**: Choose how often to send:
   - Daily
   - Weekly
   - Monthly
   - Custom schedule
2. **Time**: Set the time of day to send
3. **Timezone**: Select your timezone
4. **Start Date**: When to begin the schedule
5. **End Date**: Optional end date

## Step 5: Advanced Options

### Email Format Options

- **Attach Results**: Ensure this is checked if you want CSV/PDF attachments
- **Include Links**: Optional, for accessing full reports
- **Custom Message**: Add a message that will appear in the email body

### Data Formatting

- **Limit Rows**: Consider limiting to top N rows for e-ink display
- **Formatting**: Ensure numbers are formatted consistently
- **Headers**: Include column headers in CSV exports

## Step 6: Test the Schedule

1. Click "Send Now" or "Test" to send a test email
2. Verify the email arrives at your G Suite address
3. Check the format and content
4. Ensure attachments are included (if using CSV/PDF)

## Step 7: Activate Schedule

1. Review all settings
2. Click "Schedule" or "Save" to activate
3. The schedule will run automatically based on your configuration

## Recommended Configuration for TRMNL

### For CSV Reports (Recommended)

```
Format: CSV
Attach Results: Yes
Include Headers: Yes
Limit Rows: 50-100 (adjust based on display size)
Subject: [Report Name] - [Date]
```

### For PDF Reports

```
Format: PDF
Attach Results: Yes
Page Size: Letter or A4
Orientation: Portrait (better for e-ink)
Subject: [Report Name] - [Date]
```

## Email Query Configuration

After setting up the schedule, note the sender email address. You'll need this for your Pipedream workflow Gmail query:

- Looker typically sends from: `looker@yourdomain.com` or `noreply@looker.com`
- Check the "From" field in a test email
- Use this in your Pipedream Gmail trigger query: `from:looker@yourdomain.com`

## Multiple Reports

If you want to schedule multiple reports:

1. Create separate schedules for each report
2. Use the same target email address
3. Use distinct subject lines to identify reports
4. Update your Pipedream workflow to handle multiple report types
5. Consider adding report type identification in the transformation step

## Troubleshooting

### Emails Not Arriving
- Check spam/junk folder
- Verify email address is correct
- Check Looker delivery logs
- Verify G Suite email forwarding/filters

### Wrong Format
- Verify format selection in schedule settings
- Check Looker version supports your chosen format
- Try a different format (CSV is most reliable)

### Missing Attachments
- Ensure "Attach Results" is enabled
- Check file size limits
- Verify Looker has permission to generate attachments

## Next Steps

After configuring Looker:
1. Send a test email
2. Verify it arrives in Gmail
3. Check that your Pipedream workflow detects it
4. Verify the data appears correctly on your TRMNL display

## Reference

- [Looker Scheduling Documentation](https://docs.cloud.google.com/looker/docs/scheduling)
- [Looker Email Delivery](https://docs.cloud.google.com/looker/docs/send-email)
