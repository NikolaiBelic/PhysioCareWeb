const mongoose = require('mongoose');

let physioSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 50
    },
    surname: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 50
    },
    specialty: {
        type: String,
        required: true,
        enum: ['Sports', 'Neurological', 'Pediatric', 'Geriatric', 'Oncological'],
    },
    licenseNumber: {
        type: String,
        required: true,
        unique: true,
        match: /^[A-za-z0-9]{8}$/
    },
    image: {
        type: String,
        default: null
    }
});

let Physio = mongoose.model('physios', physioSchema);
module.exports = Physio;