const winston = require('winston');
const path = require('path');

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json()
);

// Create sales logger
const salesLogger = winston.createLogger({
  format: logFormat,
  defaultMeta: { service: 'sales-service' },
  transports: [
    // Write all logs with importance level of 'info' or higher to sales-combined.log
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/sales-combined.log'),
      level: 'info'
    }),
    // Write all logs with importance level of 'error' or higher to sales-error.log
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/sales-error.log'),
      level: 'error'
    }),
    // Write detailed debug logs
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/sales-debug.log'),
      level: 'debug'
    })
  ]
});

// Add console logging if not in production
if (process.env.NODE_ENV !== 'production') {
  salesLogger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

module.exports = {
  salesLogger
};
