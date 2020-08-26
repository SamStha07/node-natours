const express = require('express');
const morgan = require('morgan');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// middleware betn req and res
console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'production') {
    app.use(morgan('dev'));
}

app.use(express.json());

app.use((req, res, next) => {
    console.log('Hello from the middleware😂');
    next();
});

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


module.exports = app;