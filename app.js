const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const GLobalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

//Set security HTTP headers
app.use(helmet());

// middleware betn req and res

// Development loading
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// to make Node app more secure
// limits the request made while requesting data in same API
const limiter = rateLimit({
  max: 100, //100 requests from same IP varies upon different projects
  // in (headers) we can see the rate-limit and rate limit remaining
  windowMs: 60 * 60 * 1000, // in 1hr in ms
  message: 'Too many requests from this IP, please try again in an hour',
});
app.use('/api', limiter); //only limits for api requests only

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanization against XSS
app.use(xss());

// Prevent parameter pollution
// while quering or filtering as /api/tours/?sort=duration&sort=price will show the filtered data
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

// Serving static files
app.use(express.static(`${__dirname}/public`));

// Test middleware
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
