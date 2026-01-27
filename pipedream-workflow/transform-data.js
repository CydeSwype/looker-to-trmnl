// Pipedream step: Transform parsed email data into TRMNL format
// This step takes the parsed email and converts it to the format expected by TRMNL plugin

// For Pipedream v1 (most common)
export default async (event, steps) => {
  const emailData = steps.parse_email.$return_value;
    
    // Initialize TRMNL payload
    const trmnlPayload = {
      report_title: emailData.subject || 'Looker Report',
      timestamp: emailData.date || new Date().toISOString(),
      metrics: [],
      data: []
    };
    
    // Try to extract data from CSV attachment
    let csvData = null;
    if (emailData.attachments && emailData.attachments.length > 0) {
      const csvAttachment = emailData.attachments.find(
        att => att.mimeType === 'text/csv' || att.filename.endsWith('.csv')
      );
      
      if (csvAttachment && csvAttachment.content) {
        csvData = parseCSV(csvAttachment.content);
      }
    }
    
    // If no CSV, try to parse from email body
    if (!csvData && emailData.body) {
      csvData = parseCSVFromBody(emailData.body);
    }
    
    // Transform CSV data into TRMNL format
    if (csvData && csvData.length > 0) {
      // Assume first row is headers
      const headers = csvData[0];
      const rows = csvData.slice(1);
      
      // Extract metrics (first few numeric columns)
      const numericColumns = headers
        .map((header, index) => ({ header, index }))
        .filter((_, index) => {
          // Check if column contains numeric data
          return rows.some(row => {
            const value = row[index];
            return value && !isNaN(parseFloat(value));
          });
        })
        .slice(0, 4); // Limit to 4 metrics
      
      numericColumns.forEach(({ header, index }) => {
        const values = rows.map(row => parseFloat(row[index])).filter(v => !isNaN(v));
        if (values.length > 0) {
          const sum = values.reduce((a, b) => a + b, 0);
          const avg = sum / values.length;
          const lastValue = values[values.length - 1];
          const prevValue = values.length > 1 ? values[values.length - 2] : lastValue;
          const change = prevValue !== 0 ? ((lastValue - prevValue) / prevValue * 100).toFixed(1) : '0.0';
          
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
    
    // If no structured data found, create a simple message
    if (trmnlPayload.metrics.length === 0 && trmnlPayload.data.length === 0) {
      trmnlPayload.metrics.push({
        label: 'Status',
        value: 'Report Received',
        change: null
      });
      
      trmnlPayload.data = [{
        category: 'Email Subject',
        value: emailData.subject.length
      }];
    }
    
    return trmnlPayload;
};

// Alternative: For Pipedream v2 (if using defineComponent)
// Uncomment below if your Pipedream account uses v2
/*
import { defineComponent } from "@pipedream/types";

export default defineComponent({
  props: {},
  async run({ steps, $ }) {
    const emailData = steps.parse_email.$return_value;
    // ... rest of the code above ...
  },
});
*/

// Helper function to parse CSV
function parseCSV(csvText) {
  const lines = csvText.split('\n').filter(line => line.trim());
  return lines.map(line => {
    // Simple CSV parsing (handles quoted fields)
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
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

// Helper function to parse CSV-like data from email body
function parseCSVFromBody(body) {
  // Look for table-like structures in email body
  const lines = body.split('\n').filter(line => line.trim());
  const data = [];
  
  for (const line of lines) {
    // Try to split by common delimiters
    const parts = line.split(/\s{2,}|\t|,/).filter(part => part.trim());
    if (parts.length >= 2) {
      data.push(parts);
    }
  }
  
  return data.length > 0 ? data : null;
}

// Helper function to format numeric values
function formatValue(value) {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  } else {
    return `$${value.toFixed(0)}`;
  }
}
