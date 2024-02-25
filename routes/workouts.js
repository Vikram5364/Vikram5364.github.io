var express = require('express');
const axios = require('axios');
const { google } = require('googleapis');
const youtube = require('youtube-api');

const { v4: uuidv4 } = require('uuid');
const sql = require('../utils/sql');
const log = require('../utils/log');
const dbConnection = require('../utils/db');
const scheduleUtils = require('../utils/schedule');
const User = require('../models/User');
const util = require('util');
const sqlConstants = require('../constants/sqlConstants');
const userConstants = require('../constants/userConstants');
require('dotenv').config();

var router = express.Router();
const logger = log.getLogger('workouts.log');

youtube.authenticate({
    type: "key",
    key: process.env.YOUTUBE_API_KEY
});

router.get('/profile', function(req, res) {
    if (req.session.user?.username) {
        res.render('profile', { level: 'Beginner' });
    } else {
        res.render('login', { showAlert: true, alertMessage: 'You must be logged in to access this page'});
    }
});

router.post('/schedule', function(req, res) {
    if (req.session.user?.username) {
        // Check if a user entry exists; if not then create one; if yes then update the workoutlevel
        let sqlQueryToCheckUserWorkoutEntry = queryToCheckUserWorkoutEntry(req, res);
        dbConnection.getDBConnection();
        dbConnection.executeSqlQuery(sqlQueryToCheckUserWorkoutEntry)
            .then((results) => {
                logger.info(results);
                if (results.length > 0) {
                    var result = results[0];
                    if (req.body.level != result['level']) {
                        // Update the workout event in the database
                        let sqlQueryToUpdateWorkoutLevelOfUser = queryToUpdateWorkoutLevelOfUser(req, res);
                        dbConnection.executeSqlQuery(sqlQueryToUpdateWorkoutLevelOfUser)
                            .then((results) => {
                                logger.info(results);
                                if (results.affectedRows > 0) {
                                    // Fetch the workout event and render the page
                                    let workoutEvents = scheduleUtils.getWorkoutEvents(req.body.level);
                                    logger.info(workoutEvents);
                                    res.render('schedule', { events: workoutEvents });
                                } else {
                                    logger.error('Error executing SQL query:', err);
                                }
                            })
                            .catch((err) => {
                                  logger.error('Error executing SQL query:', err);
                            });
                    } else {
                        // Fetch the workout event and render the page
                        let workoutEvents = scheduleUtils.getWorkoutEvents(req.body.level);
                        logger.info(workoutEvents);
                        res.render('schedule', { events: workoutEvents });
                    }
                } else {
                // Insert a workout event in the database
                let sqlQueryToInsertNewWorkout = queryToInsertNewWorkout(req, res);
                dbConnection.executeSqlQuery(sqlQueryToInsertNewWorkout)
                    .then((results) => {
                        if (results.affectedRows > 0) {
                            // Fetch the workout event and render the page
                            let workoutEvents = scheduleUtils.getWorkoutEvents(req.body.level);
                            logger.info(workoutEvents);
                            res.render('schedule', { events: workoutEvents });
                        } else {
                            logger.error('Error executing SQL query:', err);
                        }
                    })
                    .catch(function(err) {
                        logger.error('Error executing SQL query:', err);
                    });
                }
            })
            .catch(function(err) {
                 logger.error('Error executing SQL query:', err);
            });
        return;
    } else {
        res.render('login', { showAlert: true, alertMessage: 'You must be logged in to access this page'});
    }
});

router.get('/start', function(req, res) {
    if(req.session.user?.username) {
        let sqlQueryToCheckUserWorkoutEntry = queryToCheckUserWorkoutEntry(req, res);
        dbConnection.getDBConnection();
        dbConnection.executeSqlQuery(sqlQueryToCheckUserWorkoutEntry)
            .then((results) => {
                logger.info(results);
                if (results.length > 0) {
                    // Fetch the workout event and render the page
                    logger.info(results);
                    var result = results[0];

                    // Render the workout video page
                    var category = result['category'];
                    var progress = result['progress'];
                    var level = result['level'];
                    getVideoUrl(category, (err, videoUrl) => {
                        if (err) {
                            res.status(500).send('Error occurred while fetching video');
                        } else {
                            res.render('workout', { videoUrl: videoUrl, workoutLevel: level, workoutProgress: progress });
                        }
                    });
                    return;
//                    const videoUrl = `https://www.youtube.com/embed/${response.data.items[0].id.videoId}`;
//                    res.render('workout', { videoUrl: videoUrl, workoutLevel: level, workoutProgress: progress });
                } else {
                    res.render('profile', { level: 'Beginner' });
                }
            })
            .catch(function(err) {
                logger.error('Error executing SQL query:', err);
            });
    } else {
        res.render('login', { showAlert: true, alertMessage: 'You must be logged in to access this page'});
    }
});

router.post('/complete', function(req, res) {
    if(req.session.user?.username) {
        let sqlQueryToCheckUserWorkoutEntry = queryToCheckUserWorkoutEntry(req, res);
        dbConnection.getDBConnection();
        dbConnection.executeSqlQuery(sqlQueryToCheckUserWorkoutEntry)
            .then((results) => {
                logger.info(results);
                if (results.length > 0) {
                    // Fetch the workout event and render the page
                    logger.info(results);
                    if (results[0].progress == 30) {
                        // Completed the level of workout
                        var currentLevelIndex = scheduleUtils.levels.indexOf(results[0].level);
                        if (currentLevelIndex < 2) {
                            // Completed the lower level of workout
                            var upgradedLevelIndex = currentLevelIndex + 1;
                            res.render('profile', { level: scheduleUtils.levels[upgradedLevelIndex] });
                        } else {
                            res.render('profile', { level: 'Beginner' });
                        }
                    } else {
                        let sqlQueryToUpdateWorkoutProgressOfUser = queryToUpdateWorkoutProgressOfUser(req, res);
                            dbConnection.executeSqlQuery(sqlQueryToUpdateWorkoutProgressOfUser)
                                .then((results) => {
                                     logger.info(results);
                                     if (results.affectedRows > 0) {
                                         // Fetch the workout event and render the page
                                         let workoutEvents = scheduleUtils.getWorkoutEvents(req.body.level);
                                         logger.info(workoutEvents);
                                         res.render('schedule', { events: workoutEvents });
                                     } else {
                                         logger.error('Error executing SQL query:', err);
                                     }
                                })
                                .catch((err) => {
                                     logger.error('Error executing SQL query:', err);
                                });
                    }
                } else {
                    res.render('profile', { level: 'Beginner' });
                }
            })
            .catch((err) => {
                logger.error('Error executing SQL query:', err);
            });
    } else {
        res.render('login', { showAlert: true, alertMessage: 'You must be logged in to access this page'});
    }
});


/*
 *  ==========================================================================
 *  =========================  HELPER FUNCTIONS  =============================
 *  ==========================================================================
 */

function queryToUpdateWorkoutLevelOfUser(req, res) {
  const conditions = {
    username: req.session.user['username'],
  }
  const data = {
    level: req.body.level
  }
  const sqlQueryToUpdateWorkoutLevelOfUser = sql.generateUpdateQueryForTable(sqlConstants.workoutTableName, data, conditions);
  logger.info(`Querying the Workouts Table to update Workout level: ${sqlQueryToUpdateWorkoutLevelOfUser}`);
  return sqlQueryToUpdateWorkoutLevelOfUser;
}

function queryToUpdateWorkoutProgressOfUser(req, res) {
  const conditions = {
    username: req.session.user['username'],
  }
  const data = {
    level: req.body.level,
    category: scheduleUtils.levelsWorkoutOrder.get(req.body.level)[(req.body.progress) % scheduleUtils.levelsWorkoutOrder.get(req.body.level).length],
    progress: req.body.progress
  }
  const sqlQueryToUpdateWorkoutProgressOfUser = sql.generateUpdateQueryForTable(sqlConstants.workoutTableName, data, conditions);
  logger.info(`Querying the Workouts Table to update Workout progress: ${sqlQueryToUpdateWorkoutProgressOfUser}`);
  return sqlQueryToUpdateWorkoutProgressOfUser;
}

function queryToCheckUserWorkoutEntry(req, res) {
  const columns = '*'
  const conditions = {
    username: req.session.user['username']
  }
  const sqlQueryToCheckUserWorkoutEntry = sql.generateSelectQueryWithWhere(sqlConstants.workoutTableName, columns, conditions);
  logger.info(`Querying the Workouts table to get User Workout entry: ${sqlQueryToCheckUserWorkoutEntry}`);
  return sqlQueryToCheckUserWorkoutEntry;
}

function queryToInsertNewWorkout(req, res) {
  const data = {
    username: req.session.user['username'],
    level: req.body.level,
    category: scheduleUtils.levelsWorkoutOrder.get(req.body.level)[0 % (scheduleUtils.levelsWorkoutOrder.get(req.body.level).length)],
    progress: 1
  }
  const sqlQueryToInsertNewWorkout = sql.generateInsertQueryForTable(sqlConstants.workoutTableName, data);
  logger.info(`Querying the Workout Table to insert New Workout: ${sqlQueryToInsertNewWorkout}`);
  return sqlQueryToInsertNewWorkout;
}

const getVideoUrl = (category, callback) => {
    youtube.search.list({
        part: 'snippet',
        q: `AthleanX ${category}`,
        maxResults: 1,
        type: 'video'
    }, (err, response) => {
        if (err) {
            callback(err);
        } else {
            logger.info(response.data);
            const videoUrl = `https://www.youtube.com/embed/${response.data.items[0].id.videoId}`;
            callback(null, videoUrl);
        }
    });
};

module.exports = router;