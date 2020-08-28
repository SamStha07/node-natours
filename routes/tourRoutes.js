const express = require('express');
const bodyParser = require('body-parser');
const tourController = require('../controllers/tourController');

const {
    getAllTours,
    createTour,
    getTourById,
    updateTour,
    deleteTour
} = tourController;

const router = express.Router();

router.route('/').get(getAllTours).post(createTour);

router.route('/:id').get(getTourById).patch(updateTour).delete(deleteTour);

module.exports = router;