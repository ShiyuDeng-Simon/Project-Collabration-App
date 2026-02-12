const { app, initializeDatabase } = require('../app');

// Initialize database (safe to call on cold starts)
initializeDatabase().catch((err) => {
  console.error('Database initialization error:', err);
});

module.exports = app;
