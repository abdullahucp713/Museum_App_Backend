const dotenv = require('dotenv');
const app = require('./app.js');

// dotenv
dotenv.config();

// PORT
const PORT = process.env.PORT || 4000;

// Start server for local development
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is listening at port ${PORT}`);
  });
}

module.exports = app;
