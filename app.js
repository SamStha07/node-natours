const express = require('express');
const morgan = require('morgan');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// middleware betn req and res
// console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('dev'));
}

app.use(express.json());

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// routes handlers - for homepage
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Hello from Server',
    app: 'Natours',
  });
});

// ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// middleware for unknown route to show error for all HTTPHeaders
app.all('*', (req, res, next) => {
  res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server!`,
  });
});

module.exports = app;
