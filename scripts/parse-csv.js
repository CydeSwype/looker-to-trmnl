/**
 * Utility script for parsing CSV files from Looker reports
 * Can be used for testing or as a reference for parsing logic
 */

const fs = require('fs');
const path = require('path');

/**
 * Parse CSV text into array of objects
 * @param {string} csvText - Raw CSV text
 * @param {boolean} hasHeaders - Whether first row contains headers
 * @returns {Array} Array of objects (if hasHeaders) or arrays
 */
function parseCSV(csvText, hasHeaders = true) {
  const lines = csvText.split('\n').filter(line => line.trim());
  
  if (lines.length === 0) {
    return [];
  }
  
  const parsed = [];
  
  // Parse each line
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const values = parseCSVLine(line);
    
    if (hasHeaders && i === 0) {
      // Store headers
      parsed.headers = values;
    } else {
      parsed.push(values);
    }
  }
  
  // Convert to objects if headers exist
  if (hasHeaders && parsed.headers) {
    return parsed.slice(1).map(row => {
      const obj = {};
      parsed.headers.forEach((header, index) => {
        obj[header] = row[index] || '';
      });
      return obj;
    });
  }
  
  return parsed;
}

/**
 * Parse a single CSV line, handling quoted fields
 * @param {string} line - CSV line to parse
 * @returns {Array} Array of field values
 */
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  // Add last field
  result.push(current.trim());
  
  return result;
}

/**
 * Extract metrics from CSV data
 * @param {Array} data - Parsed CSV data (array of objects)
 * @returns {Array} Array of metric objects
 */
function extractMetrics(data) {
  if (!data || data.length === 0) {
    return [];
  }
  
  const metrics = [];
  const keys = Object.keys(data[0]);
  
  // Find numeric columns
  const numericKeys = keys.filter(key => {
    return data.some(row => {
      const value = row[key];
      return value && !isNaN(parseFloat(value));
    });
  });
  
  // Extract metrics from numeric columns
  numericKeys.slice(0, 4).forEach(key => {
    const values = data
      .map(row => parseFloat(row[key]))
      .filter(v => !isNaN(v));
    
    if (values.length > 0) {
      const sum = values.reduce((a, b) => a + b, 0);
      const avg = sum / values.length;
      const lastValue = values[values.length - 1];
      const prevValue = values.length > 1 ? values[values.length - 2] : lastValue;
      const change = prevValue !== 0 
        ? ((lastValue - prevValue) / prevValue * 100).toFixed(1) 
        : '0.0';
      
      metrics.push({
        label: key,
        value: formatValue(lastValue),
        change: `${change >= 0 ? '+' : ''}${change}%`
      });
    }
  });
  
  return metrics;
}

/**
 * Format numeric value for display
 * @param {number} value - Numeric value
 * @returns {string} Formatted value
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

/**
 * Transform CSV data to TRMNL format
 * @param {string} csvText - Raw CSV text
 * @param {string} reportTitle - Report title
 * @returns {Object} TRMNL-formatted payload
 */
function transformToTRMNL(csvText, reportTitle = 'Looker Report') {
  const data = parseCSV(csvText, true);
  const metrics = extractMetrics(data);
  
  // Create data array for visualization
  const firstKey = Object.keys(data[0])[0];
  const numericKeys = Object.keys(data[0]).filter(key => {
    return data.some(row => {
      const value = row[key];
      return value && !isNaN(parseFloat(value));
    });
  });
  
  const visualizationData = data.slice(0, 10).map(row => ({
    category: row[firstKey] || 'Unknown',
    value: parseFloat(row[numericKeys[0]]) || 0
  }));
  
  return {
    report_title: reportTitle,
    timestamp: new Date().toISOString(),
    metrics: metrics,
    data: visualizationData
  };
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node parse-csv.js <csv-file> [report-title]');
    process.exit(1);
  }
  
  const csvFile = args[0];
  const reportTitle = args[1] || 'Looker Report';
  
  if (!fs.existsSync(csvFile)) {
    console.error(`Error: File not found: ${csvFile}`);
    process.exit(1);
  }
  
  const csvText = fs.readFileSync(csvFile, 'utf-8');
  const trmnlPayload = transformToTRMNL(csvText, reportTitle);
  
  console.log(JSON.stringify(trmnlPayload, null, 2));
}

module.exports = {
  parseCSV,
  extractMetrics,
  transformToTRMNL,
  formatValue
};
