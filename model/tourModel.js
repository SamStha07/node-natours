const mongoose = require('mongoose');
const slugify = require('slugify');
// const validator = require('validator'); third party library github

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name'],
        unique: true,
        trim: true,
        maxlength: [40, 'A tour name must have less or equal than 40 characters'],
        minlength: [10, 'A tour name must have more or equal than 10 characters'],
    },
    slug: String,
    duration: {
        type: Number,
        required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have a group size'],
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have a difficulty'],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'Difficulty is either: easy, medium or difficult',
        },
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'Rating must be above 1.0'],
        max: [5, 'Rating must be below 5.0'],
    },
    ratingsQuantity: {
        type: Number,
        default: 0,
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
        type: Number,
        validate: {
            // this will only work on CREATE or SAVE when we create a new tour
            validator: function (val) {
                return val < this.price;
            },
            message: 'Discount price ({VALUE}) should be below regular price',
        },
    },
    summary: {
        type: String,
        trim: true, //removes all the white space in the beginning and end of the string
        required: [true, 'A tour must have a summary'],
    },
    description: {
        type: String,
        trim: true,
    },
    imageCover: {
        type: String,
        required: [true, 'A tour must have a cover image'],
    },
    // we will have multiple images on single hotel
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false, // not to show the data created date for the user
    },
    startDates: [Date],
    secretTour: {
        type: Boolean,
        default: false,
    },
}, {
    toJSON: {
        virtuals: true,
    },
    toObject: {
        virtuals: true,
    },
});

// to show this virtual we have add objects in line 58
// also this part is not the part of DB
tourSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7;
});
// shows as "durationWeeks": this.duration/7

// MIDDLEWARES
// DOCUMENT MIDDLEWARE from mongoose: runs before .save() and .create() -- for Model
tourSchema.pre('save', function (next) {
    // this creates the url path
    this.slug = slugify(this.name, {
        lower: true
    });
    next();
});

// tourSchema.post('save', function (next) {
//   console.log('Will save document');
//   next();
// });
// tourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });

// QUERY MIDDLEWARE -- for tourController queries like CRUD
// hides the {secretTour: true} from the db and in queries
// find query == Tour.find() from getAllTours
// /^find/ = works on every starting from find
// tourSchema.pre('find', function (next) {
tourSchema.pre(/^find/, function (next) {
    this.find({
        secretTour: {
            $ne: true
        }
    });
    this.start = Date.now();
    next();
});
// runs after tourSchema.pre()
tourSchema.post(/^find/, function (docs, next) {
    console.log(`Query took ${Date.now() - this.start} milliseconds`);
    //   console.log(docs);
    next();
});

// AGGREGATION MIDDLEWARE --- for tourController like aggregate pipeline
tourSchema.pre('aggregate', function (next) {
    this.pipeline().unshift({
        $match: {
            secretTour: {
                $ne: true
            }
        }
    });
    console.log(this.pipeline());
    next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;