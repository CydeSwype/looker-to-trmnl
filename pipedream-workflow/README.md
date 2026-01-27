# Pipedream Workflow

This workflow monitors Gmail for Looker report emails, parses the content, and sends formatted data to your TRMNL plugin.

## Setup Instructions

### 1. Create New Pipedream Workflow

1. Log into [Pipedream](https://pipedream.com)
2. Click "New Workflow"
3. Choose "Start from scratch" or "Use a template"

### 2. Add Gmail Trigger

1. Click the "+" button to add a step
2. Search for "Gmail" and select "Gmail - New Email"
3. Connect your Gmail account (OAuth2)
4. Configure:
   - **Label**: Create a label like "Looker Reports" or use "INBOX"
   - **Query**: `from:looker@yourdomain.com` (adjust to match your Looker sender)
   - **Polling Interval**: 5 minutes (or as needed)

### 3. Add Code Step for Email Parsing

1. Add a new step: "Run Node.js code"
2. Copy the code from `parse-email.js`
3. This step extracts email content and attachments

### 4. Add Code Step for Data Transformation

1. Add another "Run Node.js code" step
2. Copy the code from `transform-data.js`
3. This step transforms the parsed data into TRMNL format

### 5. Add HTTP Request to TRMNL

1. Add a new step: "HTTP - Make HTTP Request"
2. Configure:
   - **Method**: POST
   - **URL**: Your TRMNL plugin webhook URL
   - **Headers**: 
     - `Content-Type: application/json`
     - `Authorization: Bearer YOUR_TRMNL_API_KEY` (if required)
   - **Body**: `{{steps.transform_data.$return_value}}`

### 6. Save and Deploy

1. Save your workflow
2. Test with a sample Looker email
3. Monitor the workflow execution logs

## Configuration

Update these variables in your workflow:

- **Gmail Query**: Adjust to match your Looker email sender
- **TRMNL Webhook URL**: From your TRMNL plugin settings
- **Report Format**: CSV, PDF, or visualization (adjust parsing logic accordingly)

## Error Handling

The workflow includes error handling for:
- Email parsing failures
- Missing attachments
- Invalid data formats
- TRMNL API errors

Check Pipedream execution logs for debugging.
