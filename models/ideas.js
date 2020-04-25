const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ideasSchema = new Schema({

    id: {
        type: Number,
        required: true
    },
    user_id: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    category: {
        type: Number,
        required: true
    },
    teaser_text: {
        type: String
    },
    full_disclosure_text: {
        type: String
    },
    keywords: {
        type: Array
    },
    license_type: {
        type: String
    },
    stage_dev: {
        type: String
    },
    created: {
        type: Date
    }

});

module.exports = mongoose.model('Ideas', ideasSchema);