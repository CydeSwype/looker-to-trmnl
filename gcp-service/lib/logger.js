/**
 * Simple logger utility
 */

function formatMessage(level, message, ...args) {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${level}] ${message}${args.length > 0 ? ' ' + JSON.stringify(args) : ''}`;
}

const logger = {
  info: (message, ...args) => {
    console.log(formatMessage('INFO', message, ...args));
  },
  error: (message, ...args) => {
    console.error(formatMessage('ERROR', message, ...args));
  },
  warn: (message, ...args) => {
    console.warn(formatMessage('WARN', message, ...args));
  },
  debug: (message, ...args) => {
    if (process.env.DEBUG) {
      console.log(formatMessage('DEBUG', message, ...args));
    }
  }
};

module.exports = { logger };
