const Tour = require('../model/tourModel');
const {
    Query
} = require('mongoose');

exports.getAllTours = async (req, res) => {
    try {
        // BUILD QUERY
        // 1A) Filtering
        const queryObj = {
            ...req.query
        };
        // console.log(queryObj);
        // http://localhost:3000/api/v1/tours?difficulty=easy&ratingsAverage=4.5&sort=3&page=2
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach(el => delete queryObj[el]); // it will delete all excludedFields from params
        //only shows this in req.query { difficulty: 'easy', ratingsAverage: '4.5' } these excepts the excluded fields

        // 1B) Advanced filtering
        let queryStr = JSON.stringify(queryObj); //{ "difficulty": "easy", "ratingsAverage": "4.5" }
        // queryStr = '{ "averageCost": { "lt": "10000" }, "test": { "gt": "12345"} }';
        const regex = /\b(gt|gte|lt|lte)\b/g;
        queryStr = queryStr.replace(regex, '$$' + "$1");
        // console.log(JSON.parse(queryStr));
        queryStr = JSON.parse(queryStr);

        let query = Tour.find(queryStr); // if we use await in this query we willnot be able to use the filter query
        // const query = Tour.find().where('duration).equals(5).where('difficulty').equals('easy')

        // 2) Sorting
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            console.log(sortBy);
            query = query.sort(sortBy);
        } else {
            query = query.sort('-createdAt');
        }

        // 3) Field limiting
        if (req.query.fields) {
            const fields = req.query.fields.split(',').join(' ');
            query = query.select(fields);
        } else {
            query = query.select('-__v'); // it will exclude from db not to show the user
        }

        // 4) Pagination
        const page = req.query.page * 1;
        const limit = req.query.limit * 1;
        const skip = (page - 1) * limit; //skip the pages upto that limit

        //page=2&limit=5
        query = query.skip(skip).limit(limit);
        if (req.query.page) {
            const numTours = await Tour.countDocuments();
            if (skip >= numTours) throw new Error('This page doesnot exist');
        }

        // EXECUTE QUERY
        // query.sort().select().skip().limit() query will change through all the queries gets called
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