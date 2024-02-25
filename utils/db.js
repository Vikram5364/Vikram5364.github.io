const mysql = require('mysql2');
const log = require('../utils/log');
var logger = log.getLogger('db.log')

// Create connection pool
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'hello123',
    database: 'fitrevolt'
});

/* Establishing DB connection (MySQL) */
function getDBConnection() {
  connection.connect((err) => {
    if (err) {
      logger.error('Error connecting to MySQL database:', err);
      return;
    }
    logger.info('Connected to MySQL database.');
  });
  sleepSync(1000);
}

function sleepSync(ms) {
  const start = Date.now();
  while (Date.now() - start < ms) {}
}

function executeSqlQuery(sqlQuery) {
  return new Promise((resolve, reject) => {
    // Execute the SQL query
    connection.query(sqlQuery, (err, results) => {
      if (err) {
        console.error('Error executing SQL query:', err);
        reject(err);
        return;
      }
      resolve(results);
    });
  });
}

module.exports = { executeSqlQuery, getDBConnection };