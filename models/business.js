var mongoose = require('mongoose');

const businessSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        },
        address: { type: String, required: true }
    }
}, { timestamps: true });

const Business = mongoose.model('Business', businessSchema);

module.exports = Business