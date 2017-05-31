var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

const ssoHelpers = require('staffbase-sso').helpers;
const staffbaseKey = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAofpxzYvjRQz7kuz4hr/YW01b+6EVVnCcUQOikdzoZuOOyD+0ThOCIl/3nfVaF9nbLKMjxwM2ChfVf7lboWb0/7YProoSZ0Hj9YVZoAftZvdHBXOpL4B/XvMu2rCngGQNBiuiiv1sInTugXXu8NKoHj0Vaa2uuO9+dyi6q0qtl15Sa1947GzBHxeowP3ZGgsEDN22giCnPSLdONt/DwX5aafK2oXSqLwpKvIN8TW+e8CLFj5xJtB6gBfyTpGqEeLMHwheT5H5ELpowB4bJFs/u0a4yk5GWX/Rt/gEdPPqLeSsTmLgX8iFa9fQVL3U7ezEbzqs4Rv5HNvs9jE4KitFxwIDAQAB";
const plguinID = 'christmascalendar';
var ssoMiddleWare = require('staffbase-sso').middleware(staffbaseKey, plguinID);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
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
  // console.log('Got SSO Request from backend', req.query);
  console.log('In redirect handler');
  if (req.sbSSO) {
    console.log('Decoded data on backend(admin):', req.sbSSO);
    res.render('plugin', req.sbSSO);
    return res.end();
  }
  res.json({
    error: {
      msg: "Unable to get token information."
    }
  });
  return res.end();
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
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
