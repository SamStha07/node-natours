const Tour = require('../model/tourModel');

exports.getAllTours = async (req, res) => {
    try {
        // BUILD QUERY
        // 1) Filtering
        const queryObj = {
            ...req.query
        };
        // console.log(queryObj);
        // http://localhost:3000/api/v1/tours?difficulty=easy&ratingsAverage=4.5&sort=3&page=2
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach(el => delete queryObj[el]); // it will delete all excludedFields from params
        //only shows this in req.query { difficulty: 'easy', ratingsAverage: '4.5' } these excepts the excluded fields

        // 2) Advanced filtering
        let queryStr = JSON.stringify(queryObj); //{ "difficulty": "easy", "ratingsAverage": "4.5" }
        // queryStr = '{ "averageCost": { "lt": "10000" }, "test": { "gt": "12345"} }';
        const regex = /\b(gt|gte|lt|lte)\b/g;
        queryStr = queryStr.replace(regex, '$$' + "$1");
        // console.log(JSON.parse(queryStr));
        queryStr = JSON.parse(queryStr);

        const query = Tour.find(queryStr); // if we use await in this query we willnot be able to use the filter query
        // const query = Tour.find().where('duration).equals(5).where('difficulty').equals('easy')

        // EXECUTE QUERY
        const tours = await query;

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