class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    filter() {
        const queryObj = {
            ...this.queryString
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

        this.query = this.query.find(queryStr); // if we use await in this query we willnot be able to use the filter query
        // const query = Tour.find().where('duration).equals(5).where('difficulty').equals('easy')
        return this;
    }
    sort() {
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ');
            // console.log(sortBy);
            this.query = this.query.sort(sortBy);
        } else {
            this.query = this.query.sort('-createdAt');
        }
        return this;
    }
    limitFields() {
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        } else {
            this.query = this.query.select('-__v'); // it will exclude from db not to show the user
        }
        return this;
    }
    paginate() {
        const page = this.queryString.page * 1;
        const limit = this.queryString.limit * 1;
        const skip = (page - 1) * limit; //skip the pages upto that limit

        //page=2&limit=5
        this.query = this.query.skip(skip).limit(limit);
        return this;
    }
}

module.exports = APIFeatures;