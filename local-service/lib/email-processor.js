/**
 * Email processing utilities
 * Handles parsing emails and generating PNG images
 */

const { createCanvas } = require('canvas');
const pdfParse = require('pdf-parse');
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
    attachments: [],
    csvData: null
  };

  // Extract headers
  const headers = emailMessage.payload.headers || [];
  emailData.subject = headers.find(h => h.name === 'Subject')?.value || '';
  emailData.from = headers.find(h => h.name === 'From')?.value || '';
  emailData.date = headers.find(h => h.name === 'Date')?.value || new Date().toISOString();

  // Extract body and attachments
  await extractBodyAndAttachments(gmail, emailMessage.id, emailMessage.payload, emailData);

  // Download and parse attachments (PDF or CSV)
  if (emailData.attachments.length > 0) {
    // Try PDF first (Looker sends PDFs)
    const pdfAttachment = emailData.attachments.find(
      att => att.mimeType === 'application/pdf' || att.filename.endsWith('.pdf')
    );
    
    if (pdfAttachment && pdfAttachment.attachmentId) {
      try {
        const pdfBuffer = await downloadAttachmentAsBuffer(gmail, emailMessage.id, pdfAttachment.attachmentId);
        const pdfText = await parsePDF(pdfBuffer);
        emailData.csvData = parsePDFTable(pdfText);
        logger.info('Successfully parsed PDF attachment');
      } catch (error) {
        logger.warn('Could not parse PDF attachment:', error.message);
      }
    }
    
    // Fallback to CSV if no PDF found
    if (!emailData.csvData) {
      const csvAttachment = emailData.attachments.find(
        att => att.mimeType === 'text/csv' || att.filename.endsWith('.csv')
      );
      
      if (csvAttachment && csvAttachment.attachmentId) {
        try {
          const csvContent = await downloadAttachment(gmail, emailMessage.id, csvAttachment.attachmentId);
          emailData.csvData = parseCSV(csvContent);
          logger.info('Successfully parsed CSV attachment');
        } catch (error) {
          logger.warn('Could not download CSV attachment:', error.message);
        }
      }
    }
  }

  // If no attachment data, try parsing from email body
  if (!emailData.csvData && emailData.body) {
    emailData.csvData = parseCSVFromBody(emailData.body);
  }

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
 * Download attachment content as text
 */
async function downloadAttachment(gmail, messageId, attachmentId) {
  try {
    const response = await gmail.users.messages.attachments.get({
      userId: 'me',
      messageId: messageId,
      id: attachmentId
    });

    const content = Buffer.from(response.data.data, 'base64').toString('utf-8');
    return content;
  } catch (error) {
    logger.error(`Error downloading attachment ${attachmentId}:`, error);
    throw error;
  }
}

/**
 * Download attachment content as buffer (for PDFs)
 */
async function downloadAttachmentAsBuffer(gmail, messageId, attachmentId) {
  try {
    const response = await gmail.users.messages.attachments.get({
      userId: 'me',
      messageId: messageId,
      id: attachmentId
    });

    return Buffer.from(response.data.data, 'base64');
  } catch (error) {
    logger.error(`Error downloading attachment ${attachmentId}:`, error);
    throw error;
  }
}

/**
 * Parse PDF and extract text
 */
async function parsePDF(pdfBuffer) {
  try {
    const data = await pdfParse(pdfBuffer);
    return data.text;
  } catch (error) {
    logger.error('Error parsing PDF:', error);
    throw error;
  }
}

/**
 * Parse PDF text into table-like structure
 * Looks for tabular data in the PDF text
 */
function parsePDFTable(pdfText) {
  const lines = pdfText.split('\n').filter(line => line.trim());
  const data = [];
  
  // Try to find table structure
  // Look for lines with multiple values separated by spaces/tabs
  for (const line of lines) {
    // Skip empty lines and headers that are too short
    if (!line.trim() || line.trim().length < 3) continue;
    
    // Try splitting by multiple spaces (common in PDF tables)
    const parts = line.split(/\s{2,}|\t/).filter(part => part.trim());
    
    // If we have at least 2 columns, treat as data row
    if (parts.length >= 2) {
      data.push(parts);
    } else {
      // Try splitting by single space if multiple spaces didn't work
      const singleSpaceParts = line.split(/\s+/).filter(part => part.trim());
      if (singleSpaceParts.length >= 2) {
        data.push(singleSpaceParts);
      }
    }
  }
  
  // If we found data, return it
  if (data.length > 0) {
    logger.info(`Extracted ${data.length} rows from PDF`);
    return data;
  }
  
  // Fallback: return null if no table structure found
  logger.warn('Could not extract table structure from PDF');
  return null;
}

/**
 * Generate PNG image from email data
 */
async function generatePNG(emailData, options = {}) {
  const width = options.width || 800;
  const height = options.height || 600;
  
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // White background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  // Black text for e-ink
  ctx.fillStyle = '#000000';
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;

  // Title
  ctx.font = 'bold 32px Arial';
  const title = emailData.subject || 'Looker Report';
  ctx.fillText(title, 40, 50);

  // Date
  ctx.font = '16px Arial';
  const date = new Date(emailData.date).toLocaleDateString();
  ctx.fillText(date, 40, 80);

  let yPos = 120;

  // If we have CSV data, render it
  if (emailData.csvData && emailData.csvData.length > 0) {
    const headers = emailData.csvData[0];
    const rows = emailData.csvData.slice(1, 11); // Limit to 10 rows

    // Table header
    ctx.font = 'bold 14px Arial';
    const colWidth = (width - 80) / headers.length;
    headers.forEach((header, i) => {
      ctx.fillText(header.substring(0, 15), 40 + i * colWidth, yPos);
    });

    yPos += 30;
    ctx.strokeRect(40, yPos - 20, width - 80, 1);

    // Table rows
    ctx.font = '12px Arial';
    rows.forEach((row, rowIndex) => {
      if (yPos > height - 50) return; // Don't overflow
      
      row.forEach((cell, i) => {
        const cellText = String(cell || '').substring(0, 15);
        ctx.fillText(cellText, 40 + i * colWidth, yPos);
      });
      yPos += 25;
    });
  } else {
    // No data - show message
    ctx.font = '18px Arial';
    ctx.fillText('No data found in email', 40, yPos);
  }

  // Convert to PNG buffer
  return canvas.toBuffer('image/png');
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

module.exports = {
  parseEmail,
  generatePNG,
  downloadAttachment,
  downloadAttachmentAsBuffer,
  parsePDF,
  parsePDFTable,
  parseCSV
};
