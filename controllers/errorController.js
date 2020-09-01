const AppError = require('../utils/appError');

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // Operational error, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
  // Programming or other unknown error: don't leak error details to the client
  else {
    // 1) log error
    console.error('ERROR', err);

    // 2) Send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong',
    });
  }
};

const handleCastErrorDB = (error) => {
  const message = `Invalid ${error.path}: ${error.value}.`;
  return new AppError(message, 400);
};

// const handleDuplicateFieldDB = (error) => {
//   const message = `Duplicate field value ${error.keyValue.name}: Please use another key value`;
//   return new AppError(message, 400);
// };

const handleValidationErrorDB = (error) => {
  const message = `Invalid input data`;
  return new AppError(message, 400);
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  }
  // Production part isnot running
  else if (process.env.NODE_ENV === 'production') {
    // error showing to the client using mongoose DB error
    let error = {
      ...err,
    };
    if (error.name === 'CastError') error = handleCastErrorDB(error); // this line willnot run because there isnot error.name in the error

    // Duplicate database fields
    if (error.code === 11000) error = handleDuplicateFieldDB(error);

    // if (error.name === 'ValidationError')
    //   error = handleValidationErrorDB(error);

    sendErrorProd(error, res);
  }
};
