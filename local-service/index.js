#!/usr/bin/env node
/**
 * Local Service: Looker to TRMNL Pipeline
 * 
 * Runs on Mac mini to:
 * 1. Poll Gmail API for new Looker report emails
 * 2. Parse email content and CSV attachments
 * 3. Generate PNG image from data
 * 4. POST PNG directly to TRMNL image webhook
 * 
 * Can be run manually or scheduled with cron/launchd
 */

require('dotenv').config();
const { google } = require('googleapis');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const { parseEmail, generatePNG } = require('./lib/email-processor');
const { logger } = require('./lib/logger');

// Configuration from environment variables
const config = {
  gmail: {
    credentialsPath: process.env.GMAIL_CREDENTIALS_PATH || path.join(__dirname, '../example-project-for-ian-e67ca0405681.json'),
    userEmail: process.env.GMAIL_USER_EMAIL || 'looker-reports@yourdomain.com',
    query: process.env.GMAIL_QUERY || 'from:looker@yourdomain.com',
    label: process.env.GMAIL_LABEL || 'INBOX',
  },
  trmnl: {
    imageWebhookUrl: process.env.TRMNL_IMAGE_WEBHOOK_URL,
    apiKey: process.env.TRMNL_API_KEY || null,
  },
  service: {
    maxEmailsPerRun: parseInt(process.env.MAX_EMAILS_PER_RUN || '10', 10),
    imageWidth: parseInt(process.env.IMAGE_WIDTH || '800', 10),
    imageHeight: parseInt(process.env.IMAGE_HEIGHT || '600', 10),
  }
};

/**
 * Main processing function
 */
async function processEmails() {
  if (!config.trmnl.imageWebhookUrl) {
    throw new Error('TRMNL_IMAGE_WEBHOOK_URL environment variable not set');
  }

  if (!fs.existsSync(config.gmail.credentialsPath)) {
    throw new Error(`Gmail credentials file not found: ${config.gmail.credentialsPath}`);
  }

  // Initialize Gmail API client
  const gmail = await initializeGmail();

  // Search for emails
  logger.info(`Searching for emails with query: ${config.gmail.query}`);
  const messages = await searchEmails(gmail, config.gmail.query, config.service.maxEmailsPerRun);

  if (messages.length === 0) {
    logger.info('No new emails found');
    return { processed: 0, messages: [] };
  }

  logger.info(`Found ${messages.length} email(s)`);

  const results = [];
  for (const messageId of messages) {
    try {
      // Get email details
      const email = await getEmail(gmail, messageId);
      
      // Parse email
      const emailData = await parseEmail(gmail, email);
      
      // Generate PNG image
      const pngBuffer = await generatePNG(emailData, {
        width: config.service.imageWidth,
        height: config.service.imageHeight
      });
      
      // Send PNG to TRMNL
      await sendImageToTRMNL(pngBuffer, emailData.subject || 'Looker Report');
      
      // Mark email as read (optional)
      await markAsRead(gmail, messageId);
      
      results.push({
        messageId,
        subject: emailData.subject,
        success: true
      });
      
      logger.info(`Successfully processed email: ${emailData.subject}`);
    } catch (error) {
      logger.error(`Error processing email ${messageId}:`, error);
      results.push({
        messageId,
        success: false,
        error: error.message
      });
    }
  }

  return {
    processed: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
    messages: results
  };
}

/**
 * Initialize Gmail API client
 */
async function initializeGmail() {
  const credentials = JSON.parse(fs.readFileSync(config.gmail.credentialsPath, 'utf-8'));
  
  const auth = new google.auth.GoogleAuth({
    scopes: [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.modify'
    ],
    credentials: credentials
  });

  const authClient = await auth.getClient();
  const gmail = google.gmail({ version: 'v1', auth: authClient });

  return gmail;
}

/**
 * Search for emails matching query
 */
async function searchEmails(gmail, query, maxResults = 10) {
  try {
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults: maxResults
    });

    return (response.data.messages || []).map(msg => msg.id);
  } catch (error) {
    logger.error('Error searching emails:', error);
    throw error;
  }
}

/**
 * Get full email details
 */
async function getEmail(gmail, messageId) {
  try {
    const response = await gmail.users.messages.get({
      userId: 'me',
      id: messageId,
      format: 'full'
    });

    return response.data;
  } catch (error) {
    logger.error(`Error getting email ${messageId}:`, error);
    throw error;
  }
}

/**
 * Mark email as read
 */
async function markAsRead(gmail, messageId) {
  try {
    await gmail.users.messages.modify({
      userId: 'me',
      id: messageId,
      requestBody: {
        removeLabelIds: ['UNREAD']
      }
    });
  } catch (error) {
    logger.warn(`Could not mark email ${messageId} as read:`, error.message);
  }
}

/**
 * Send PNG image to TRMNL image webhook
 */
async function sendImageToTRMNL(pngBuffer, filename = 'report.png') {
  const formData = new FormData();
  formData.append('image', pngBuffer, {
    filename: filename,
    contentType: 'image/png'
  });

  const headers = {
    ...formData.getHeaders()
  };

  if (config.trmnl.apiKey) {
    headers['Authorization'] = `Bearer ${config.trmnl.apiKey}`;
  }

  try {
    const response = await axios.post(config.trmnl.imageWebhookUrl, formData, { 
      headers,
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });
    logger.info(`Sent image to TRMNL: ${response.status}`);
    return response.data;
  } catch (error) {
    logger.error('Error sending image to TRMNL:', error.response?.data || error.message);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  processEmails()
    .then(result => {
      logger.info('Processing complete:', result);
      process.exit(0);
    })
    .catch(error => {
      logger.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { processEmails };
