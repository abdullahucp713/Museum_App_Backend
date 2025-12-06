const dotenv = require('dotenv');
const dbConnect = require('./config/db.js');
const app = require('./app.js');

// dotenv - load first
dotenv.config();

// PORT - Render provides PORT in environment variable
const PORT = process.env.PORT || 4000;

// Start server
if (require.main === module) {
  // Connect to database on startup
  dbConnect()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Server is listening at port ${PORT}`);
        console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      });
    })
    .catch((error) => {
      console.error('Failed to start server:', error);
      process.exit(1);
    });
}

module.exports = app;
