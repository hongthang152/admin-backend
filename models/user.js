var mongoose = require('mongoose');
var crypto = require('crypto'); 

const userSchema = new mongoose.Schema({
    username: { type: String, unique: true, required : true },
    hash: { type: String },
    salt: { type: String }
}, { timestamps: true });

userSchema.methods.setPassword = function(password) { 
    this.salt = crypto.randomBytes(16).toString('hex'); 
    this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, `sha512`).toString(`hex`); 
}; 

userSchema.methods.validPassword = function(password) { 
    var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, `sha512`).toString(`hex`); 
    return this.hash === hash; 
}; 

const User = mongoose.model('User', userSchema);

module.exports = User