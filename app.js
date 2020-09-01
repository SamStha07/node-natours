const express = require('express');
const morgan = require('morgan');

const AppError = require('./utils/appError');
const GLobalErrorHandler = require('./controllers/errorController');
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
// Global error handling Middleware
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(GLobalErrorHandler);

module.exports = app;