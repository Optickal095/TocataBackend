const jwt = require("jsonwebtoken");
const { JWT_SECRET_KEY } = require("../constants");

// Create Access Token
function createAccessToken(user) {
  const expToken = new Date();
  // Expiration: 3 Hours
  expToken.setHours(expToken.getHours() + 3);

  const payload = {
    token_type: "access",
    user_id: user._id,
    iat: Date.now(),
    exp: expToken.getTime(),
  };

  return jwt.sign(payload, JWT_SECRET_KEY);
}

// Create Refresh Token
function createRefreshToken(user) {
  const expToken = new Date();
  // Expiration: 1 Month
  expToken.getMonth(expToken.getMonth() + 1);

  const payload = {
    token_type: "refresh",
    user_id: user._id,
    iat: Date.now(),
    exp: expToken.getTime(),
  };

  return jwt.sign(payload, JWT_SECRET_KEY);
}

// Get Token Data
function decoded(token) {
  return jwt.decode(token, JWT_SECRET_KEY, true);
}

module.exports = {
  createAccessToken,
  createRefreshToken,
  decoded,
};
