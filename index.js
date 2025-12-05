const dotenv = require('dotenv');
const dbConnect = require('./config/db.js');
const app = require('./app.js');

// dotenv
dotenv.config();

// PORT
const PORT = process.env.PORT || 4000;

// Start server for local development
if (require.main === module) {
  // Connect to database on startup for local development
  dbConnect().then(() => {
    app.listen(PORT, () => {
      console.log(`Server is listening at port ${PORT}`);
    });
  }).catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
}

module.exports = app;
