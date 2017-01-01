var formidable = require('formidable');
var fs = require('fs-extra');
var path = require('path');
var Publisher = require('../models/publisher');
var Reader = require('../models/reader');
var Book = require('../models/book');
var mongoose = require('mongoose');
var configDB = require('./database.js');
mongoose.connect(configDB.url);



exports.saveBook = function (req, res) {
    var form = new formidable.IncomingForm();
    //form.uploadDir = path.join(__dirname, "../public/images");
    form.parse(req ,function (err, fields, files) {
        //console.log(files.file.path);
        console.log('files: ' ,files);
        console.log('fields: ', fields);
        if (err){
            console.error(err);
        } else {
            res.redirect('/dashboard');
        }

    });
}