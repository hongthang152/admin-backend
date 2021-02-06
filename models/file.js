var mongoose = require('mongoose');


const fileSchema = new mongoose.Schema({
    name: { type: String, unique: true, required : true },
    pin: { type: String, unique: true, required: true },
    url: { type: String, unique: true, required: true }
}, { timestamps: true });

fileSchema.method('toJSON', function() {
    var obj = this.toObject();

    //Rename fields
    obj.id = obj._id;
    delete obj._id;

    return obj;
});

const File = mongoose.model('File', fileSchema);

module.exports = File