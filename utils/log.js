const winston = require('winston');

function getLogger(logFile) {
    const logger = winston.createLogger({
        level: 'info', // Set the minimum logging level
        format: winston.format.combine(
            winston.format.timestamp(), // Add timestamp to the logs
            winston.format.json() // JSON format for logs
        ),
        transports: [
            new winston.transports.Console(), // Output logs to the console
            new winston.transports.File({ filename: logFile }) // Output logs to a file
        ]
    });
    return logger;
}

module.exports = { getLogger }