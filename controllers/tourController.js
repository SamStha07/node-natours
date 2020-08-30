const Tour = require('../model/tourModel');
const APIFeatures = require('../utils/apiFeatures');

//middleware to filter the tours
exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
};

exports.getAllTours = async (req, res) => {
    try {
        // EXECUTE QUERY
        // query.sort().select().skip().limit() query will change through all the queries gets called
        const features = new APIFeatures(Tour.find(), req.query).filter().sort().limitFields().paginate();
        const tours = await features.query;

        // SEND RESPONSE
        res.status(200).json({
            status: 'success',
            results: tours.length,
            data: {
                tours: tours,
            },
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err
        });
    }
};

exports.getTourById = async (req, res) => {
    try {
        // Tour.findOne({_id: req.params.id})
        const tour = await Tour.findById(req.params.id);
        res.status(200).json({
            status: 'success',
            data: {
                tours: tour,
            },
        });

    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err
        });
    }

};

exports.createTour = async (req, res) => {
    try {
        const newTour = await Tour.create(req.body);

        res.status(201).json({
            status: 'success',
            data: {
                tours: newTour,
            },
        });
    } catch (err) {
        // erros coming from not having required fields from Tour model
        res.status(400).json({
            status: 'fail',
            message: err
        });
    }

};

exports.updateTour = async (req, res) => {
    try {
        const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        res.status(200).json({
            status: 'success',
            data: {
                tour: tour,
            },
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err
        });
    }

};

exports.deleteTour = async (req, res) => {
    try {
        const tour = await Tour.findByIdAndDelete(req.params.id);
        res.status(204).json({
            status: 'success',
            data: {
                tour
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err
        });
    }
};

// aggregate means it will check all Tours checks/$match ratingsAverage=4.5 and calculates all the $group queries
exports.getTourStats = async (req, res) => {
    try {
        const stats = await Tour.aggregate([{
                $match: {
                    ratingsAverage: {
                        $gte: 4.5
                    }
                }
            },
            {
                $group: {
                    // _id: '$difficulty',
                    _id: {
                        $toUpper: '$difficulty' // will shows with the difficulty level as medium, difficult & easy
                    },
                    // _id: '$ratingsAverage', //show will the average ratings category
                    numRatings: {
                        $sum: '$ratingsQuantity' //all ratings given by users to all Tours
                    },
                    numTours: {
                        $sum: 1 // total no of tours in DB
                    },
                    avgRating: {
                        $avg: '$ratingsAverage'
                    },
                    avgPrice: {
                        $avg: '$price'
                    },
                    minPrice: {
                        $min: '$price'
                    },
                    maxPrice: {
                        $max: '$price'
                    }
                }
            },
            {
                $sort: {
                    avgPrice: 1 //-1
                }
            },
            // {
            //     $match: {
            //         _id: {
            //             $ne: 'EASY' // ne = not equal and excludes EASY must match the UPPERCASE level from $group _id which is in uppercase
            //         }
            //     }
            // }
        ]);
        res.status(200).json({
            status: 'success',
            data: {
                stats
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err
        });
    }
}

// business plan
// monthly tours count to make available the tour guides required as per month
exports.getMonthlyPlan = async (req, res) => {
    try {
        const year = req.params.year * 1; // 2021
        const plan = await Tour.aggregate([{
                $unwind: '$startDates',
            },
            {
                $match: {
                    startDates: {
                        $gte: new Date(`${year}-01-01`),
                        $lte: new Date(`${year}-12-31`),
                    }
                }
            },
            {
                $group: {
                    // we only need month not other fields
                    _id: {
                        $month: '$startDates'
                    },
                    // no of tours in a month
                    numTourStarts: {
                        $sum: 1
                    },
                    // name of the tours in a month
                    tours: {
                        $push: '$name'
                    }
                }
            },
            {
                $addFields: {
                    month: '$_id'
                }
            },
            {
                $project: {
                    _id: 0 // removes _id from $group
                }
            },
            {
                $sort: {
                    // numTourStarts: -1,  //shows the higher tours in a month in descending order
                    month: 1 // starts from 1
                }
            },
            // {
            //     $limit: 12 // show only 12 tours similar to limit query
            // }
        ]);
        res.status(200).json({
            status: 'success',
            data: {
                plan
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err
        });
    }
}