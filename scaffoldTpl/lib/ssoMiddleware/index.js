const StaffBaseSSO = require("staffbase-sso").sso;
const helpers = require("staffbase-sso").helpers;
const TOKEN_QUERY_PARAM = "jwt";

function ssoMiddleWare(secret) {
  secret = secret || process.env.STAFFBASE_SSO_SECRET;
  // Convert key under the hood
  let formattedSecret;
  try {
    formattedSecret = helpers.transformKeyToFormat(secret);
  } catch (err) {
    console.log("Unable to transform key to right format.", err);
    formattedSecret = null;
  }
  return function (req, res, next) {
    if (!formattedSecret) {
      console.log("Unsupported secret.");
      return next();
    }
    if (req.query[TOKEN_QUERY_PARAM]) {
      let token = req.query[TOKEN_QUERY_PARAM];
      try {
        let SSOContents = new StaffBaseSSO(formattedSecret, token);
        let tokenData = SSOContents.getTokenData();
        req.sbSSO = tokenData;
        console.log("TokenData:", tokenData);
        return next();
      } catch (error_) {
        console.log("Error decoding token:", error_);
        return next();
      }
    }
    next();
  };
}

module.exports = ssoMiddleWare;
