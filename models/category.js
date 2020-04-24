const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const categoriesSchema = new Schema({

    id: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Category', categoriesSchema);