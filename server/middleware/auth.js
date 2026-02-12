const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is not set!');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    if (user && typeof user === 'object') {
      if (typeof user.userId === 'string') user.userId = user.userId.trim();
      if (typeof user.email === 'string') user.email = user.email.trim();
      if (typeof user.firstName === 'string') user.firstName = user.firstName.trim();
      if (typeof user.lastName === 'string') user.lastName = user.lastName.trim();
    }
    req.user = user;
    next();
  });
};

module.exports = { authenticateToken };
