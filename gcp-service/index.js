/**
 * GCP Service: Looker to TRMNL Pipeline
 * 
 * This service:
 * 1. Polls Gmail API for new Looker report emails
 * 2. Parses email content and CSV attachments
 * 3. Transforms data into TRMNL format
 * 4. Sends to TRMNL webhook
 * 
 * Designed to run on Cloud Run, triggered by Cloud Scheduler (daily)
 */

const express = require('express');
const { google } = require('googleapis');
const axios = require('axios');
const { parseEmail, transformToTRMNL } = require('./lib/email-processor');
const { logger } = require('./lib/logger');

const app = express();
app.use(express.json());

// Configuration from environment variables
const config = {
  gmail: {
    // Service account JSON or OAuth2 credentials
    credentials: process.env.GMAIL_CREDENTIALS ? JSON.parse(process.env.GMAIL_CREDENTIALS) : null,
    userEmail: process.env.GMAIL_USER_EMAIL || 'looker-reports@yourdomain.com',
    query: process.env.GMAIL_QUERY || 'from:looker@yourdomain.com',
    label: process.env.GMAIL_LABEL || 'INBOX',
  },
  trmnl: {
    webhookUrl: process.env.TRMNL_WEBHOOK_URL,
    apiKey: process.env.TRMNL_API_KEY || null, // Optional
  },
  service: {
    port: process.env.PORT || 8080,
    maxEmailsPerRun: parseInt(process.env.MAX_EMAILS_PER_RUN || '10', 10),
  }
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Manual trigger endpoint (for testing)
app.post('/process', async (req, res) => {
  try {
    logger.info('Manual trigger received');
    const result = await processEmails();
    res.json({ success: true, result });
  } catch (error) {
    logger.error('Error processing emails:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Cloud Scheduler trigger endpoint (GET for cron)
app.get('/cron', async (req, res) => {
  try {
    logger.info('Cron trigger received');
    const result = await processEmails();
    res.json({ success: true, result });
  } catch (error) {
    logger.error('Error processing emails:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Main processing function
 */
async function processEmails() {
  if (!config.trmnl.webhookUrl) {
    throw new Error('TRMNL_WEBHOOK_URL environment variable not set');
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
      
      // Transform to TRMNL format
      const trmnlPayload = await transformToTRMNL(emailData, gmail);
      
      // Send to TRMNL
      await sendToTRMNL(trmnlPayload);
      
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
  const auth = new google.auth.GoogleAuth({
    scopes: [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.modify'
    ],
    credentials: config.gmail.credentials
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
    // Don't throw - this is optional
  }
}

/**
 * Send data to TRMNL webhook
 */
async function sendToTRMNL(payload) {
  const headers = {
    'Content-Type': 'application/json'
  };

  if (config.trmnl.apiKey) {
    headers['Authorization'] = `Bearer ${config.trmnl.apiKey}`;
  }

  try {
    const response = await axios.post(config.trmnl.webhookUrl, payload, { headers });
    logger.info(`Sent to TRMNL: ${response.status}`);
    return response.data;
  } catch (error) {
    logger.error('Error sending to TRMNL:', error.response?.data || error.message);
    throw error;
  }
}

// Start server
const server = app.listen(config.service.port, () => {
  logger.info(`Looker to TRMNL service listening on port ${config.service.port}`);
  logger.info(`Health check: http://localhost:${config.service.port}/health`);
  logger.info(`Manual trigger: POST http://localhost:${config.service.port}/process`);
  logger.info(`Cron trigger: GET http://localhost:${config.service.port}/cron`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

module.exports = app;
