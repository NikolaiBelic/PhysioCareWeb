const express = require('express');

let Record = require(__dirname + '/../models/record.js');
let Patient = require(__dirname + '/../models/patient.js');
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
    Patient.find({ surname: { $regex: req.query.surname/* new RegExp(`^${req.query.surname}$`) */, $options: 'i' } }).then(resultSurname => {
        if (resultSurname) {
            Record.find({ patient: resultSurname[0]._id }, 'medicalRecord appointments -_id').then(result => {
                if (result.length > 0)
                    res.status(200)
                        .send({ result: result });
                else
                    res.status(404)
                        .send({
                            error: "No se han encontrado expedientes con esos criterios"
                        });
            }).catch(error => {
                res.status(500)
                    .send({
                        error: "Error interno del servidor"
                    });
            });
        }
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
        res.status(201)
            .send({ result: result });
    }).catch(error => {
        res.status(400)
            .send({
                error: "Error añadiendo expediente"
            });
    });
});

router.post('/:id/appointments', (req, res) => {
    Record.findOne({ patient: req.params.id }).then(result => {
        if (result) {
            result.appointments.push({
                date: req.body.date,
                physio: req.body.physio,
                diagnosis: req.body.diagnosis,
                treatment: req.body.treatment,
                observations: req.body.observations
            });
            console.log(result.appointments);
            result.save().then(savedResult => {
                res.status(201).send({ 
                    result: savedResult 
                });
            }).catch(error => {
                console.error("Error al guardar el expediente:", error);
                res.status(500).send({
                    error: "Error interno del servidor"
                });
            });
        } else {
            res.status(404).send({
                error: "Expediente no encontrado"
            });
        }
    }).catch(error => {
        res.status(500).send({
            error: "Error interno del servidor"
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