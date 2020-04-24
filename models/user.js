const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({

    id: {
        type: Number,
        required: true
    },
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    keywords: {
        type: Array
    },
    occupations: {
        type: String
    },
    organizations: {
        type: Array
    },
    locations:{
        type: Array
    },
    interacted_ideas:{
        type: Array
    },
    followees:{
        type: Array
    },
    categories:{
        type: Array
    },
    license_types:{
        type: Array
    },
    published_ideas: {
        type: Array
    }
});

module.exports = mongoose.model('User', userSchema);