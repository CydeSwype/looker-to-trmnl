/**
 * Email processing utilities
 * Handles parsing emails and transforming to TRMNL format
 */

const { logger } = require('./logger');

/**
 * Parse email from Gmail API response
 */
async function parseEmail(gmail, emailMessage) {
  const emailData = {
    id: emailMessage.id,
    subject: '',
    from: '',
    date: '',
    body: '',
    attachments: []
  };

  // Extract headers
  const headers = emailMessage.payload.headers || [];
  emailData.subject = headers.find(h => h.name === 'Subject')?.value || '';
  emailData.from = headers.find(h => h.name === 'From')?.value || '';
  emailData.date = headers.find(h => h.name === 'Date')?.value || new Date().toISOString();

  // Extract body and attachments
  await extractBodyAndAttachments(gmail, emailMessage.id, emailMessage.payload, emailData);

  return emailData;
}

/**
 * Recursively extract body and attachments from email payload
 */
async function extractBodyAndAttachments(gmail, messageId, payload, emailData) {
  if (payload.body) {
    // Leaf node - extract data
    if (payload.body.data) {
      const content = Buffer.from(payload.body.data, 'base64').toString('utf-8');
      
      if (payload.mimeType === 'text/plain') {
        emailData.body = content;
      } else if (payload.mimeType === 'text/html') {
        // Strip HTML tags for plain text
        emailData.body = content.replace(/<[^>]*>/g, '');
      }
    }

    // Handle attachments
    if (payload.filename && payload.body.attachmentId) {
      emailData.attachments.push({
        filename: payload.filename,
        mimeType: payload.mimeType,
        attachmentId: payload.body.attachmentId
      });
    }
  }

  // Recurse into parts
  if (payload.parts) {
    for (const part of payload.parts) {
      await extractBodyAndAttachments(gmail, messageId, part, emailData);
    }
  }
}

/**
 * Download attachment content
 */
async function downloadAttachment(gmail, messageId, attachmentId) {
  try {
    const response = await gmail.users.messages.attachments.get({
      userId: 'me',
      messageId: messageId,
      id: attachmentId
    });

    return Buffer.from(response.data.data, 'base64').toString('utf-8');
  } catch (error) {
    logger.error(`Error downloading attachment ${attachmentId}:`, error);
    throw error;
  }
}

/**
 * Transform email data to TRMNL format
 */
async function transformToTRMNL(emailData, gmail = null) {
  const trmnlPayload = {
    report_title: emailData.subject || 'Looker Report',
    timestamp: emailData.date || new Date().toISOString(),
    metrics: [],
    data: []
  };

  // Find CSV attachment
  const csvAttachment = emailData.attachments.find(
    att => att.mimeType === 'text/csv' || att.filename.endsWith('.csv')
  );

  let csvData = null;

  // Download and parse CSV if found
  if (csvAttachment && gmail) {
    try {
      const csvContent = await downloadAttachment(gmail, emailData.id, csvAttachment.attachmentId);
      csvData = parseCSV(csvContent);
    } catch (error) {
      logger.warn('Could not download CSV attachment:', error.message);
    }
  }

  // If no CSV, try parsing from email body
  if (!csvData && emailData.body) {
    csvData = parseCSVFromBody(emailData.body);
  }

  // Transform CSV data
  if (csvData && csvData.length > 0) {
    const headers = csvData[0];
    const rows = csvData.slice(1);

    // Extract metrics from numeric columns
    const numericColumns = headers
      .map((header, index) => ({ header, index }))
      .filter(({ index }) => {
        return rows.some(row => {
          const value = row[index];
          return value && !isNaN(parseFloat(value));
        });
      })
      .slice(0, 4); // Limit to 4 metrics

    numericColumns.forEach(({ header, index }) => {
      const values = rows
        .map(row => parseFloat(row[index]))
        .filter(v => !isNaN(v));

      if (values.length > 0) {
        const lastValue = values[values.length - 1];
        const prevValue = values.length > 1 ? values[values.length - 2] : lastValue;
        const change = prevValue !== 0
          ? ((lastValue - prevValue) / prevValue * 100).toFixed(1)
          : '0.0';

        trmnlPayload.metrics.push({
          label: header,
          value: formatValue(lastValue),
          change: `${change >= 0 ? '+' : ''}${change}%`
        });
      }
    });

    // Create data array for visualization
    if (headers.length >= 2) {
      const categoryCol = headers[0];
      const valueCol = numericColumns[0]?.header || headers[1];
      const valueIndex = headers.indexOf(valueCol);

      trmnlPayload.data = rows.slice(0, 10).map(row => ({
        category: row[0] || 'Unknown',
        value: parseFloat(row[valueIndex]) || 0
      }));
    }
  }

  // Fallback if no structured data
  if (trmnlPayload.metrics.length === 0 && trmnlPayload.data.length === 0) {
    trmnlPayload.metrics.push({
      label: 'Status',
      value: 'Report Received',
      change: null
    });
  }

  return trmnlPayload;
}

/**
 * Parse CSV text
 */
function parseCSV(csvText) {
  const lines = csvText.split('\n').filter(line => line.trim());
  return lines.map(line => {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());

    return result;
  });
}

/**
 * Parse CSV-like data from email body
 */
function parseCSVFromBody(body) {
  const lines = body.split('\n').filter(line => line.trim());
  const data = [];

  for (const line of lines) {
    const parts = line.split(/\s{2,}|\t|,/).filter(part => part.trim());
    if (parts.length >= 2) {
      data.push(parts);
    }
  }

  return data.length > 0 ? data : null;
}

/**
 * Format numeric value for display
 */
function formatValue(value) {
  if (Math.abs(value) >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  } else if (Math.abs(value) >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  } else {
    return `$${value.toFixed(0)}`;
  }
}

module.exports = {
  parseEmail,
  transformToTRMNL,
  downloadAttachment,
  parseCSV,
  formatValue
};
