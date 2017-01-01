const mongoose  = require('mongoose'),
    bcrypt    = require('bcrypt-nodejs');

var bookSchema = mongoose.Schema({
    _id         : mongoose.Schema.ObjectId,
    title       : {type: String, default:''},
    bookPath    : {type: String, default:''},
    samplePath  : {type: String, default:''},
    ISBN        : {type: String, default:''},
    publishDate : {type: Date,  default: Date.now()},
    publisher : {
        _id     : mongoose.Schema.ObjectId,
        name    : {type: String, default:''},
        address : {type: String, default:''},
        contact : {type: String, default:''}
    },
    author      : {type: String, default:''},
    genre_tags  : [String],
    unitPrice   : Number,
    coverImage  : {type: String, default:''},
    comments    : [
        {
            userID  : mongoose.Schema.ObjectId ,
            text    : String
        }
    ],
});


module.exports = mongoose.model('Book', bookSchema);