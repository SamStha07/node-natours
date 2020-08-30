const express = require('express');
const tourController = require('../controllers/tourController');

const {
    getAllTours,
    createTour,
    getTourById,
    updateTour,
    deleteTour,
    aliasTopTours,
    getTourStats
} = tourController;

const router = express.Router();

router.route('/tour-stats').get(getTourStats);

router.route('/top-5-cheapTours').get(aliasTopTours, getAllTours);

router.route('/').get(getAllTours).post(createTour);

router.route('/:id').get(getTourById).patch(updateTour).delete(deleteTour);

module.exports = router;