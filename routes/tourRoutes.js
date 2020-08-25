const express = require('express');
const bodyParser = require('body-parser');
const tourHandler = require('../routeHandlers/tourHandler');

const {
    getAllTours,
    createTour,
    getTourById,
    updateTour,
    deleteTour,
    checkID,
    checkBody
} = tourHandler;

const router = express.Router();

// middleware
router.param('id', checkID);

router.route('/').get(getAllTours).post(checkBody, createTour);

// middleware yo route ma matra chalxa bcz of id param
router.route('/:id').get(getTourById).patch(updateTour).delete(deleteTour);

module.exports = router;