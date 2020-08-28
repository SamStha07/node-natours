const dotenv = require('dotenv');
const mongoose = require('mongoose');

const app = require('./app');

dotenv.config({
    path: './config.env',
});

const DB = process.env.MONGO_URI;

mongoose
    .connect(DB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log('Mongoose connected...');
    })
    .catch((err) => {
        console.log(err);
    });

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server running on port ${port}...`);
});