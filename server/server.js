const PORT = process.env.PORT || 8000;
const { app, initializeDatabase } = require('./app');

// Start server (local development)
async function startServer() {
  await initializeDatabase();
  app.listen(PORT, () => {
    console.log(`Server running on PORT ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
