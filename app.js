require('dotenv').config()
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
var CronJob = require('cron').CronJob;
var fs = require('fs');
var File = require('./models/file');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(cors({ origin: '*' }));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = process.env.MODE === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

var job = new CronJob('0 */12 * * *', async () => {
  var oneWeek = new Date();
  oneWeek = new Date(oneWeek.setDate(oneWeek.getDate() - 7));
  var files = await File.find({ created_at: {$gte: oneWeek} });
  for(var file of files) {
    fs.unlinkSync(`public/files/${file.name}`);
    await File.findByIdAndRemove(file._id);
  }
}, null, true, 'America/Los_Angeles');
job.start();

module.exports = app;
