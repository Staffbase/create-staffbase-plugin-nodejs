import * as express from 'express';
import * as path from 'path';
import favicon from 'serve-favicon';
import * as logger from 'morgan';
import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';
import * as staffbaseSDK from '@staffbase/staffbase-plugin-sdk';

import index from './routes/index';
import users from './routes/users';

const app = express();

const staffbaseKey = null;
const pluginID = null;
const ssoMiddleWare = staffbaseSDK.middleware(staffbaseKey, pluginID);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

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
app.get('/frontEnd', (req, res) => {
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
  const err = {message: 'Not Found', status: 400};
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

export default app;
