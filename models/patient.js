const mongoose = require('mongoose');

let patientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        minlength: [2, 'Name must be at least 2 characters'],
        maxlength: [50, 'Name must be at most 50 characters']
    },
    surname: {
        type: String,
        required: [true, 'Surname is required'],
        minlength: [2, 'Surname must be at least 2 characters'],
        maxlength: [50, 'Surname must be at most 50 characters']
    },
    birthDate: {
        type: Date,
        required: [true, 'Birth date is required']
    },
    address: {
        type: String,
        maxlength: [100, 'Address must be at most 100 characters']
    },
    insuranceNumber: {
        type: String,
        required: [true, 'Insurance number is required'],
        unique: true,
        match: [/^[A-za-z0-9]{9}$/, 'Insurance number must be 9 characters long']
    },
    image: {
        type: String,
        default: null
    }
});

let Patient = mongoose.model('patients', patientSchema);
module.exports = Patient;