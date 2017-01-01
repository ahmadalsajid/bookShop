const mongoose  = require('mongoose'),
      bcrypt    = require('bcrypt-nodejs');

var readerSchema = mongoose.Schema({
    name        : {type: String, default:''},
    //username    : String,     //email is enough to verify sign in/login
    password    : {type: String, default:''},
    email       : {type: String, default:''},
    address     : {type: String, default:''},
    mobile      : {type: String, default:''},
    books       : [],
    imagePath   : {type: String, default:''},
    roll        : {type: String, default: 'Reader'}    //flag to detect reader
});


readerSchema.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

readerSchema.methods.validPassword =function (password) {
    return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('Reader', readerSchema);