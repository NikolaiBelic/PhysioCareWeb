const express = require('express');
const bcrypt = require('bcrypt');

const saltRounds = 10;

let Patient = require(__dirname + '/../models/patient.js');
let User = require(__dirname + '/../models/user.js');

let router = express.Router();

router.get('/', (req, res) => {
    Patient.find().then(resultado => {
        res.render('patients_list', { patients: resultado });
    }).catch(error => {
        res.render('error', { error: 'Error listando pacientes' });
    });
});

router.get('/find', (req, res) => {
    if (req.query.surname === "") {
        Patient.find().then(result => {
            if (result)
                res.status(200)
                    .send({ result: result });
            else
                res.status(404)
                    .send({
                        error: "No hay pacientes en el sistema"
                    });
        }).catch(error => {
            res.status(500)
                .send({
                    error: "Error interno del servidor"
                });
        });
    } else {
        Patient.find({ surname: { $regex: req.query.surname /* new RegExp(`^${req.query.surname}$`) */, $options: 'i' } }).then(result => {
            if (result.length > 0)
                res.status(200)
                    .send({ result: result });
            else
                res.status(404)
                    .send({
                        error: "No se han encontrado pacientes con esos criterios"
                    });
        }).catch(error => {
            res.status(500)
                .send({
                    error: "Error interno del servidor"
                });
        });
    }
});

router.get('/:id', (req, res) => {
    Patient.findById(req.params.id).then(result => {
        if (result)
            res.render('patient_detail', { patient: result });
        else
            res.render('error', { error: "Paciente no encontrado" });
    }).catch(error => {
    });
});

router.post('/', async (req, res) => {
    try {
        let newPatient = new Patient({
            name: req.body.name,
            surname: req.body.surname,
            birthDate: req.body.birthDate,
            address: req.body.address,
            insuranceNumber: req.body.insuranceNumber,
        });
        const patientResult = await newPatient.save();
        res.status(201).send({ result: patientResult });
    } catch (error) {
        console.error("Error guardando el usuario o el paciente:", error);
        res.status(500).send({
            error: "Error interno del servidor"
        });
    }
});

router.put('/:id', (req, res) => {
    Patient.findByIdAndUpdate(req.params.id, {
        $set: {
            name: req.body.name,
            surname: req.body.surname,
            birthDate: req.body.birthDate,
            address: req.body.address,
            insuranceNumber: req.body.insuranceNumber
        }
    }, { new: true, runValidators: true }).then(result => {
        if (result) {
            res.status(200)
                .send({ result: result });
        }
        else {
            res.status(400)
                .send({ error: "Error actualizando los datos del paciente" })
        }
    }).catch(error => {
        res.status(500)
            .send({
                error: "Error interno del servidor"
            });
    });
});

router.delete('/:id', (req, res) => {
    Patient.findByIdAndDelete(req.params.id).then(resultado => {
        res.redirect(req.baseUrl);
    }).catch(error => {
        res.render('error', { error: "Error borrando paciente" });
    });
});

module.exports = router;