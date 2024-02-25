var express = require('express');
const sql = require('../utils/sql');
const log = require('../utils/log');
const dbConnection = require('../utils/db');
const User = require('../models/User');
const util = require('util');
const sqlConstants = require('../constants/sqlConstants');
const userConstants = require('../constants/userConstants');

var router = express.Router();
const logger = log.getLogger('users.log');

router.get('/bmi', function(req, res) {
    if (req.session.user?.username) {
        res.render('bmi', { showAlert: false });
    } else {
        res.render('login', { showAlert: true, alertMessage: "You must be logged in to access this page" });
    }
});

router.get('/body_type', function(req, res) {
    if (req.session.user?.username) {
        res.render('body_type', { showAlert: false });
    } else {
        res.render('login', { showAlert: true, alertMessage: "You must be logged in to access this page" });
    }
});

/* GET users listing. */
router.post('/bmi', function(req, res) {
    logger.info(req);
    let sqlQueryToInsertUserInputsBMI = queryToInsertUserInputsBMI(req, res);

    dbConnection.getDBConnection();

    dbConnection.executeSqlQuery(sqlQueryToInsertUserInputsBMI)
        .then((results) => {
            if (results.affectedRows > 0) {
                logger.info("BMI user input successful");
                res.render('body_type', { showAlert: false });
                return;
            } else {
                logger.info("BMI user input unsuccessful");
                res.render('bmi', { showAlert: true, alertMessage: "BMI user input failed" });
                return;
            }
        })
        .catch((err) => {
            logger.error('Error executing SQL query:', err);
        });
});

router.post('/body_type', function(req, res) {
    let sqlQueryToUpdateUserInputsBodyType = queryToUpdateUserInputsBodyType(req, res);

    dbConnection.getDBConnection();

    dbConnection.executeSqlQuery(sqlQueryToUpdateUserInputsBodyType)
        .then((results) => {
            if (results.affectedRows > 0) {
                logger.info("BodyType user input successful");
                res.render('profile', { level: 'Beginner' });
                return;
            } else {
                logger.info("BodyType user input unsuccessful");
                res.render('body_type', { showAlert: true, alertMessage: "BodyType user input failed" });
                return;
            }
        })
        .catch((err) => {
            logger.error('Error executing SQL query:', err);
        });
});

/*
 *  ==========================================================================
 *  =========================  HELPER FUNCTIONS  =============================
 *  ==========================================================================
 */

function queryToInsertUserInputsBMI(req, res) {
  const data = {
    username: req.session.user['username'],
    age: req.body.age,
    height: req.body.height,
    weight: req.body.weight
  }
  logger.info(data);
  const sqlQueryToInsertNewInputsBMI = sql.generateInsertQueryForTable(sqlConstants.inputTableName, data);
  logger.info(`Querying the Inputs Table to insert BMI inputs: ${sqlQueryToInsertNewInputsBMI}`);
  return sqlQueryToInsertNewInputsBMI;
}

function queryToUpdateUserInputsBMI(req, res) {
  const conditions = {
    username: req.session.user['username'],
  }
  const data = {
    age: req.body.age,
    height: req.body.height,
    weight: req.body.weight
  }
  const sqlQueryToUpdateUserInputsBMI = sql.generateUpdateQueryForTable(sqlConstants.inputTableName, data, conditions);
  logger.info(`Querying the Inputs Table to update BMI inputs: ${sqlQueryToUpdateUserInputsBMI}`);
  return sqlQueryToUpdateUserInputsBMI;
}

function queryToUpdateUserInputsBodyType(req, res) {
  const conditions = {
    username: req.session.user['username'],
  }
  const data = {
    body_type: req.body.bodyType
  }
  const sqlQueryToUpdateUserInputsBodyType = sql.generateUpdateQueryForTable(sqlConstants.inputTableName, data, conditions);
  logger.info(`Querying the Inputs Table to update BodyType input: ${sqlQueryToUpdateUserInputsBodyType}`);
  return sqlQueryToUpdateUserInputsBodyType;
}

module.exports = router;
