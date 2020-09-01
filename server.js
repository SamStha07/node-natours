const dotenv = require('dotenv');
const mongoose = require('mongoose');

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION!, SHUTTING DOWN....');
  console.log(err.name, err.message);
  process.exit(1);
});

//console.log(x) //uncaughtException will handle undefined values

dotenv.config({
  path: './config.env',
});
const app = require('./app');

const DB = process.env.MONGO_URI;

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => {
    console.log('Mongoose connected...');
  });

const port = process.env.PORT || 5000;
const server = app.listen(port, () => {
  console.log(`Server running on port ${port}...`);
});

// this will handle all errors coming from mongodb
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION!, SHUTTING DOWN....');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
