var express = require('express');
const { v4: uuidv4 } = require('uuid');

const sql = require('../utils/sql');
const log = require('../utils/log');
const dbConnection = require('../utils/db');
const User = require('../models/User');
const util = require('util');
const sqlConstants = require('../constants/sqlConstants');
const userConstants = require('../constants/userConstants');
const workoutsRouter = require('./workouts');

var router = express.Router();
const logger = log.getLogger('users.log');

/* GET login page. */
router.get('/', function(req, res, next) {
    if (req.session && req.session.user && req.session.user['firstname']) {
        res.render('index', { firstname: req.session.user['firstname'] });
    } else {
        res.render('login');
    }
});

router.get('/register', function(req, res, next) {
    if (req.session && req.session.user && req.session.user['firstname']) {
        res.render('index', { firstname: req.session.user['firstname'] });
    } else {
        res.render('register', { showAlert: false });
    }
});

router.post('/login', function(req, res, next) {
  let sqlQueryToCheckIfUserExists = queryToCheckIfUserExists(req, res);
  let sqlQueryForCheckLoginCredentials = queryToCheckLoginCredentials(req, res);

  dbConnection.getDBConnection();

  dbConnection.executeSqlQuery(sqlQueryToCheckIfUserExists)
      .then((results) => {
        logger.info(results);
        if (results.length > 0) {
            dbConnection.executeSqlQuery(sqlQueryForCheckLoginCredentials)
                  .then((results) => {
                    logger.info(results);
                    if (results.length > 0) {
                      logger.info("Login Credentials are accurate! Login Successful :)");
                      result = results[0];
                      if (req.session && req.session.user && req.session.user['firsttime']) {
                          req.session.user = {
                              username: result[userConstants.USER_USERNAME],
                              firstname: result[userConstants.USER_FIRST_NAME],
                              firsttime: true
                          };
                          res.render('bmi', { showAlert: true, alertMessage: "Welcome " + result[userConstants.USER_FIRST_NAME] });
                      } else {
                          req.session.user = {
                              username: result[userConstants.USER_USERNAME],
                              firstname: result[userConstants.USER_FIRST_NAME],
                              firsttime: false
                          };
                          let sqlQueryToCheckUserWorkoutEntry = workoutsRouter.queryToCheckUserWorkoutEntry(req, res);
                          dbConnection.executeSqlQuery(sqlQueryToCheckUserWorkoutEntry)
                            .then((results) => {
                                if (results.length > 0) {
                                    // Redirect it to the profile current workout level
                                    res.render('profile', { level: results[0]['level'] });
                                } else {
                                    // Redirect it to the profile Beginner workout level; since new user
                                    res.render('profile', { level: 'Beginner' });
                                }
                            })
                            .catch((err) => {
                                 logger.error('Error executing SQL query:', err);
                            });
                      }
                      return;
                    } else {
                      logger.info("Login Credentials are inaccurate! Login Unsuccessful :(");
                      res.render('login', { showAlert: true, alertMessage: 'Incorrect username or password' });
                      return;
                    }
                  })
                  .catch((err) => {
                    logger.error('Error executing SQL query:', err);
                  });
        } else {
            logger.info("User does not exist! Please Register!");
            res.render('login', { showAlert: true, alertMessage: 'User does not exist! Please Register!' });
            return;
        }
      })
      .catch((err) => {
        logger.error('Error executing SQL query:', err);
      });
});

router.post('/register', function(req, res, next) {
  logger.info(`Request received for user registration -> Request: ${req}`)

  let sqlQueryForOldUser = queryForOldUser(req, res);
  let sqlQueryForNewUserWithUnavailableUsername = queryForUnavailableUsername(req, res);
  let sqlQueryToInsertNewUser = queryToInsertNewUser(req, res);

  dbConnection.getDBConnection();

  dbConnection.executeSqlQuery(sqlQueryForOldUser)
      .then((results) => {
        logger.info(results);
        if (Object.values(results[0])[0] > 0) {
          logger.info("Detected old user");
          res.render('register', { showAlert: true, alertMessage: "Already a user! please login." });
          return;
        }
      })
      .catch((err) => {
        logger.error('Error executing SQL query:', err);
      });

  dbConnection.executeSqlQuery(sqlQueryForNewUserWithUnavailableUsername)
      .then((results) => {
        logger.info(results);
        if (Object.values(results[0])[0] > 0) {
          logger.info("Unavailable username");
          res.render('register', { showAlert: true, alertMessage: "Username unavailable! please pick another one." });
          return;
        }
      })
      .catch((err) => {
        logger.error('Error executing SQL query:', err);
      });

  dbConnection.executeSqlQuery(sqlQueryToInsertNewUser)
      .then((results) => {
        logger.info(results);
        if (results.affectedRows > 0) {
          logger.info("Successfully added new user");
          req.session.user = { firsttime: true };
          res.render('login', { showAlert: true, alertMessage: "Registration Successful! Please login" });
          return;
        } else {
          logger.info("Registration unsuccessful");
          res.render('register', { showAlert: true, alertMessage: "Invalid registration credentials" });
          return;
        }
      })
      .catch((err) => {
        logger.error('Error executing SQL query:', err);
      });
});

router.get('/logout', (req, res) => {
    // Destroy session
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            res.send('Error logging out.');
        } else {
            res.send('Logged out successfully!');
        }
    });
});




/*
 *  ==========================================================================
 *  =========================  HELPER FUNCTIONS  =============================
 *  ==========================================================================
 */





/**
 * Check if a user is an old user.
 * @returns {string} - return number.
 */
function queryForOldUser(req, res) {
  const columns = '*'
  const conditions = {
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    username: req.body.username
  }
  const sqlQueryForOldUser = sql.generateSelectCountQueryWithWhere(sqlConstants.userTableName, columns, conditions);
  logger.info(`Querying the Users Table For Old User: ${sqlQueryForOldUser}`);
  return sqlQueryForOldUser;
}

/**
 * Check if a username is unavailable.
 * @returns {string} - return number.
 */
function queryForUnavailableUsername(req, res) {
  const columns = '*'
  const conditions = {
    username: req.body.username
  }
  const sqlQueryForNewUserWithUnavailableUsername = sql.generateSelectCountQueryWithWhere(sqlConstants.userTableName, columns, conditions);
  logger.info(`Querying the Users Table For New User with Unavailable username: ${sqlQueryForNewUserWithUnavailableUsername}`);
  return sqlQueryForNewUserWithUnavailableUsername;
}

/**
 * Insert new user.
 * @returns {string} - return number.
 */
function queryToInsertNewUser(req, res) {
  const data = {
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    username: req.body.username,
    password: req.body.password
  }
  const sqlQueryToInsertNewUser = sql.generateInsertQueryForTable(sqlConstants.userTableName, data);
  logger.info(`Querying the Users Table to insert New User: ${sqlQueryToInsertNewUser}`);
  return sqlQueryToInsertNewUser;
}

/**
 * Login old user.
 * @returns {string} - return number.
 */
function queryToCheckLoginCredentials(req, res) {
  const columns = '*'
  const conditions = {
    username: req.body.username,
    password: req.body.password
  }
  const sqlQueryToCheckLoginCredentials = sql.generateSelectQueryWithWhere(sqlConstants.userTableName, columns, conditions);
  logger.info(`Querying the Users Table to check login credentials: ${sqlQueryToCheckLoginCredentials}`);
  return sqlQueryToCheckLoginCredentials;
}

/**
 * Login old user.
 * @returns {string} - return number.
 */
function queryToCheckIfUserExists(req, res) {
  const columns = '*'
  const conditions = {
    username: req.body.username
  }
  const sqlQueryToCheckIfUserExists = sql.generateSelectQueryWithWhere(sqlConstants.userTableName, columns, conditions);
  logger.info(`Querying the Users Table to check is user exists: ${sqlQueryToCheckIfUserExists}`);
  return sqlQueryToCheckIfUserExists;
}

module.exports = router;
