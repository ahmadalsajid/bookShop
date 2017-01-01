const mongoose  = require('mongoose'),
    bcrypt    = require('bcrypt-nodejs');

var publisherSchema = mongoose.Schema({
    name        : {type: String, default:''},
    //username    : String,         //email is enough to verify sign in/login
    password    : {type: String, default:''},
    email       : {type: String, default:''},
    address     : {type: String, default:''},
    contact     : {type: String, default:''},   //[String],
    imagePath   : {type: String, default:''},
    roll        : {type: String, default: 'Publisher'}       //flag to detect publisher
});


publisherSchema.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

publisherSchema.methods.validPassword =function (password) {
    return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('Publisher', publisherSchema);