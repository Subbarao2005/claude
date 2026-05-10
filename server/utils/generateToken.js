const jwt = require('jsonwebtoken');

/**
 * Generates a JWT token for a given payload.
 * Throws an error if JWT_SECRET is not defined in the environment.
 * @param {Object} payload - Data to be encoded in the token
 * @returns {string} - Generated JWT
 */
const generateToken = (payload) => {
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    throw new Error('CRITICAL: JWT_SECRET is not defined in environment variables. Token generation failed.');
  }

  return jwt.sign(payload, secret, { expiresIn: '7d' });
};

module.exports = generateToken;
