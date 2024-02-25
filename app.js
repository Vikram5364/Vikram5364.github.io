var createError = require('http-errors');
var express = require('express');
var path = require('path');
const session = require('express-session');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('dotenv').config(); // Load environment variables from .env file

var usersRouter = require('./routes/users');
var inputsRouter = require('./routes/inputs');
var workoutsRouter = require('./routes/workouts');

var app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
// app.set('models', path.join(__dirname, 'models'));
// app.set('constants', path.join(__dirname, 'constants'));
// app.set('utils', path.join(__dirname, 'utils'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET, // Use the secret key from environment variables
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', usersRouter);
app.use('/inputs', inputsRouter);
app.use('/workouts', workoutsRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
