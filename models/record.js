const mongoose = require('mongoose');

let appointmentSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: [true, 'La fecha es obligatoria']
    },
    physio: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'physios',
        required: [true, 'El fisio es obligatorio']
    },
    diagnosis: {
        type: String,
        required: [true, 'El diagnóstico es obligatorio'],
        minlength: [10, 'El diagnóstico debe tener al menos 10 caracteres'],
        maxlength: [500, 'El diagnóstico no puede tener más de 500 caracteres']
    },
    treatment: {
        type: String,
        required: [true, 'El tratamiento es obligatorio']
    },
    observations: {
        type: String,
        maxlength: [500, 'Las observaciones no pueden tener más de 500 caracteres']
    }
});

let recordSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'patients',
        required: [true, 'El paciente es obligatorio'],
        unique: true
    },
    medicalRecord: {
        type: String,
        required: [true, 'El expediente es obligatorio'],
        maxlength: [1000, 'El expediente no puede tener más de 1000 caracteres']
    },
    appointments: [appointmentSchema]
});

let Record = mongoose.model('records', recordSchema);

module.exports = Record;
