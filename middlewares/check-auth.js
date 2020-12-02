const jwt = require('jsonwebtoken');

const HttpError = require('../models/http-errors');

module.exports = (req, res, next) => {
  if (req.method === 'OPTIONS') {
    return next();
  }
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
       token = req.headers.authorization.split(':')[1]; // Authorization: 'Bearer TOKEN'
    }
    if (!token) {
      throw new Error('Authentication failed!');
    }
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    req.userData = { userId: decodedToken.userId };
    next();
  } catch (err) {
    const error = new HttpError('Authentication failed! Please login again or signup', 403);
    return next(error);
  }
};
