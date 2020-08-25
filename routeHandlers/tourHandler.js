const fs = require('fs');

const tours = JSON.parse(
    fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

exports.getAllTours = (req, res) => {
    console.log(req.requestTime);
    res.status(200).json({
        status: 'success',
        requestesAt: req.requestTime,
        results: tours.length,
        data: {
            tours: tours,
        },
    });
};

exports.getTourById = (req, res) => {
    console.log(req.params);
    const id = req.params.id * 1; // changing string to number
    const tour = tours.find((el) => el.id === id);
    // console.log(tour);

    // if (id > tours.length) {
    if (!tour) {
        return res.status(404).json({
            status: 'fail',
            message: 'Invalid ID',
        });
    }

    res.status(200).json({
        status: 'success',
        data: {
            tours: tour,
        },
    });
};

exports.createTour = (req, res) => {
    // console.log(req.body);
    const newId = tours[tours.length - 1].id + 1;
    const newTour = Object.assign({
            id: newId,
        },
        req.body
    );

    tours.push(newTour);
    fs.writeFile(
        `${__dirname}/dev-data/data/tours-simple.json`,
        JSON.stringify(tours),
        (err) => {
            res.status(201).json({
                status: 'success',
                data: {
                    tours: newTour,
                },
            });
        }
    );
};

exports.updateTour = (req, res) => {
    const id = req.params.id * 1; // changing string to number
    if (id > tours.length) {
        return res.status(404).json({
            status: 'fail',
            message: 'Invalid ID',
        });
    }
    res.status(200).json({
        status: 'success',
        data: {
            tours: '<Updated tour here...>',
        },
    });
};

exports.deleteTour = (req, res) => {
    const id = req.params.id * 1; // changing string to number
    if (id > tours.length) {
        return res.status(404).json({
            status: 'fail',
            message: 'Invalid ID',
        });
    }
    res.status(204).json({
        status: 'success',
        data: null,
    });
};