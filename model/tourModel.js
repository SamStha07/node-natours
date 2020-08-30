const mongoose = require('mongoose');
const router = require('../routes/tourRoutes');

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name'],
        unique: true,
        trim: true
    },
    duration: {
        type: Number,
        required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have a group size']
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have a difficulty']
    },
    ratingsAverage: {
        type: Number,
        default: 4.5
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a price'],
    },
    priceDiscount: Number,
    summary: {
        type: String,
        trim: true, //removes all the white space in the beginning and end of the string
        required: [true, 'A tour must have a description']
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: [true, 'A tour must have a cover image']
    },
    // we will have multiple images on single hotel
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false // not to show the data created date for the user
    },
    startDates: [Date],
}, {
    toJSON: {
        virtuals: true
    },
    toObject: {
        virtuals: true
    }
});

// to show this virtual we have add objects in line 58
// also this part is not the part of DB
tourSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7;
});
// shows as "durationWeeks": this.duration/7

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;