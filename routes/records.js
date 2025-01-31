const express = require('express');

let Record = require(__dirname + '/../models/record.js');
let Patient = require(__dirname + '/../models/patient.js');
let Physio = require(__dirname + '/../models/physio.js');

let router = express.Router();

router.get('/', (req, res) => {
    Record.find().populate('patient').then(result => {
        res.render('records_list', { records: result });
    }).catch(error => {
        res.render('error', { error: 'Error listando expedientes' });
    });
});

// ARREGLAR PARA BUSCAR TODOS LOS PACIENTES CON EL MISMO APELLIDO
router.get('/find', (req, res) => {
    let surnameQuery = req.query.surname ? { surname: { $regex: req.query.surname, $options: 'i' } } : {};

    Patient.find(surnameQuery).then(patients => {
        if (patients.length > 0) {
            let patientIds = patients.map(patient => patient._id);
            return Record.find({ patient: { $in: patientIds } }).populate('patient');
        } else {
            res.render('error', { error: "No se encontraron expedientes asociados al apellido ingresado." });
            return null; // Añadir esta línea para evitar que se intente enviar otra respuesta
        }
    }).then(records => {
        if (records) {
            if (records.length > 0) {
                res.render('records_list', { records: records });
            } else {
                res.render('error', { error: "No se encontraron expedientes asociados al apellido ingresado." });
            }
        }
    }).catch(error => {
        res.render('error', { error: "Hubo un problema al procesar la búsqueda. Inténtelo más tarde." });
    });
});

router.get('/new', (req, res) => {
    Patient.find().then(patients => {
        res.render('record_add', { patients: patients });
    }).catch(error => {
        res.render('error', { error: 'Error cargando el formulario de nuevo expediente' });
    });
});

// POR ID DE PACIENTE
router.get('/:id', (req, res) => {
    Record.findById(req.params.id).populate('patient').populate({
        path: 'appointments',
        populate: { path: 'physio' }
    }).then(resultado => {
        if (resultado)
            res.render('record_detail', { record: resultado });
        else
            res.render('error', { error: 'Expediente no encontrado' });
    }).catch(error => {
        res.render('error', { error: 'Error buscando expediente' });
    });
});

router.post('/', (req, res) => {
    let newRecord = new Record({
        patient: req.body.patient,
        medicalRecord: req.body.medicalRecord
    });

    newRecord.save().then(result => {
        res.redirect('/records');
    }).catch(error => {
        let errores = {
            general: 'Error insertando expediente'
        };
        if (error.errors) {
            if (error.errors.patient) {
                errores.patient = error.errors.patient.message;
            }
            if (error.errors.medicalRecord) {
                errores.medicalRecord = error.errors.medicalRecord.message;
            }
        } else {
            errores.general = 'Error interno del servidor';
        }
        Patient.find().then(patients => {
            res.render('record_add', { errores: errores, datos: req.body, patients: patients });
        }).catch(err => {
            res.render('error', { error: 'Error cargando el formulario de nuevo expediente' });
        });
    });
});

router.get('/:id/appointments/new', (req, res) => {
    Record.findById(req.params.id).populate('patient').then(record => {
        if (record) {
            Physio.find().then(physios => {
                res.render('record_add_appointment', { record: record, physios: physios });
            }).catch(error => {
                res.render('error', { error: 'Error cargando la lista de fisios' });
            });
        } else {
            res.render('error', { error: "Expediente no encontrado" });
        }
    }).catch(error => {
        res.render('error', { error: 'Error cargando el formulario de nueva cita' });
    });
});

router.post('/:id/appointments', (req, res) => {
    Record.findById(req.params.id).then(record => {
        if (record) {
            record.appointments.push({
                date: req.body.date,
                physio: req.body.physio,
                diagnosis: req.body.diagnosis,
                treatment: req.body.treatment,
                observations: req.body.observations
            });
            return record.save();
        } else {
            res.render('error', { error: "Expediente no encontrado" });
        }
    }).then(result => {
        res.redirect('/records/' + req.params.id);
    }).catch(error => {
        let errores = {
            general: 'Error insertando cita'
        };
        console.log(error);
        console.log('-------------------');
        console.log(error.errors);
        console.log(error.errors['appointments.0.date']);
        if (error.errors) {
            if (error.errors['appointments.0.date']) {
                errores.date = error.errors['appointments.0.date'].message;
            }
            if (error.errors['appointments.0.physio']) {
                errores.physio = error.errors['appointments.0.physio'].message;
            }
            if (error.errors['appointments.0.diagnosis']) {
                errores.diagnosis = error.errors['appointments.0.diagnosis'].message;
            }
            if (error.errors['appointments.0.treatment']) {
                errores.treatment = error.errors['appointments.0.treatment'].message;
            }
            if (error.errors['appointments.0.observations']) {
                errores.observations = error.errors['appointments.0.observations'].message;
            }
        } else {
            errores.general = 'Error interno del servidor';
        }
        Record.findById(req.params.id).populate('patient').then(record => {
            Physio.find().then(physios => {
                res.render('record_add_appointment', { errores: errores, datos: req.body, record: record, physios: physios });
            }).catch(err => {
                res.render('error', { error: 'Error cargando la lista de fisios' });
            });
        }).catch(err => {
            res.render('error', { error: 'Error cargando el formulario de nueva cita' });
        });
    });
});

router.delete('/:id', (req, res) => {
    Record.findByIdAndDelete(req.params.id).then(result => {
        res.redirect(req.baseUrl);
    }).catch(error => {
        res.render('error', { error: "Error borrando expediente" });
    });
});

module.exports = router;