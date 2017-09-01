// load the things we need
var mongoose = require('mongoose');

// define the schema for our user model
var roomSchema = mongoose.Schema({
    local: {
        room: String,
        person: String
    }
});

// create model for users and export.
module.exports = mongoose.model('Room', roomSchema);