const dbConnection = require('./utils/db');
const sqlConstants = require('./constants/sqlConstants');
const log = require('./utils/log');
const logger = log.getLogger('generate-sql-tables.log');

function getSqlQueryToCreateUsersTable() {
    return `CREATE TABLE IF NOT EXISTS ${sqlConstants.userTableName} (firstname varchar(50) not null, lastname varchar(50) not null, username varchar(50) primary key, password varchar(255) not null);`;
}

function getSqlQueryToCreateWorkoutsTable() {
    return `CREATE TABLE IF NOT EXISTS ${sqlConstants.workoutTableName} (username VARCHAR(255) PRIMARY KEY,  level ENUM('Beginner', 'Intermediate', 'Advanced'),  category ENUM('Chest', 'Arms', 'Back', 'Abs', 'Legs', 'Cardio'),  progress INT);`;
}

function getSqlQueryToCreateInputsTable() {
    return `CREATE TABLE IF NOT EXISTS ${sqlConstants.inputTableName} (username VARCHAR(255) PRIMARY KEY, age INT, body_type ENUM('Ectomorph', 'Endomorph', 'Mesomorph'), height DECIMAL, weight DECIMAL);`;
}

dbConnection.getDBConnection();
dbConnection.executeSqlQuery(getSqlQueryToCreateUsersTable())
    .then((results) => {
        logger.info(results);
        logger.info("Users table created successfully");
        return;
    })
    .catch((err) => {
        logger.error(err);
    });
dbConnection.executeSqlQuery(getSqlQueryToCreateWorkoutsTable())
    .then((results) => {
        logger.info(results);
        logger.info("Workouts table created successfully");
        return;
    })
    .catch((err) => {
        logger.error(err);
    });
dbConnection.executeSqlQuery(getSqlQueryToCreateInputsTable())
    .then((results) => {
        logger.info(results);
        logger.info("Inputs table created successfully");
        return;
    })
    .catch((err) => {
        logger.error(err);
    });


