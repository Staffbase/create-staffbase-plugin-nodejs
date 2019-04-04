import * as StaffBaseSSO from '@staffbase/staffbase-plugin-sdk';
const TOKEN_QUERY_PARAM = 'jwt';
const SSO = StaffBaseSSO.sso;
const helpers = StaffBaseSSO.helpers;

function ssoMiddleWare(secret) {
  secret = secret || process.env.STAFFBASE_SSO_SECRET;
  // Convert key under the hood
  let formattedSecret;
  try {
    formattedSecret = helpers.transformKeyToFormat(secret);
  } catch (err) {
    console.log('Unable to transform key to right format.', err);
    formattedSecret = null;
  }
  return (req, res, next) => {
    if (!formattedSecret) {
      console.log('Unsupported secret.');
      return next();
    }
    if (req.query[TOKEN_QUERY_PARAM]) {
      let token = req.query[TOKEN_QUERY_PARAM];
      try {
      	let SSOContents = new SSO(formattedSecret, token);
      	let tokenData = SSOContents.getTokenData();
        req.sbSSO = tokenData;
        console.log('TokenData:', tokenData);
        return next();
      } catch(tokenErr) {
      	console.log('Error decoding token:', tokenErr);
        return next();
      }
    }
    next();
  };
}

module.exports = ssoMiddleWare;
