let express = require('express');
let path = require('path');
let favicon = require('serve-favicon');
let logger = require('morgan');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');

let index = require('./routes/index');
let users = require('./routes/users');

let app = express();

const ssoHelpers = require('staffbase-sso').helpers;
const staffbaseKey = null;
const plguinID = null;
let ssoMiddleWare;
ssoMiddleWare = require('staffbase-sso').middleware(staffbaseKey, plguinID);


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

// Frontend Handler
app.use('/frontEnd', ssoMiddleWare);
app.get('/frontEnd', function(req, res) {
  res.render('plugin', req.sbSSO);
});

// Setup SSO Milleware on the endpoint server
app.use('/staffbase/sso/backoffice', ssoMiddleWare);

// Handle SSO response from server with decoded data
app.get('/staffbase/sso/backoffice', function(req, res) {
  // Middleware was able to decode the token
  if (req.sbSSO) {
    console.log('Decoded data on backend(admin):', req.sbSSO);
    res.render('plugin', req.sbSSO);
    return res.end();
  }
  res.json({
    error: {
      msg: 'Unable to get token information.',
    },
  });
  return res.end();
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
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
