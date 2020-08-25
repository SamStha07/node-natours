const express = require('express');
const tourHandler = require('../routeHandlers/tourHandler');

const {
    getAllTours,
    createTour,
    getTourById,
    updateTour,
    deleteTour
} = tourHandler;

const router = express.Router();

router.route('/').get(getAllTours).post(createTour);

router.route('/:id').get(getTourById).patch(updateTour).delete(deleteTour);

module.exports = router;