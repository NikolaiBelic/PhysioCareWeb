const express = require('express');
const multer = require('multer');

const saltRounds = 10;

let Patient = require(__dirname + '/../models/patient.js');
let User = require(__dirname + '/../models/user.js');

let router = express.Router();

// Ejercicio: Middleware para mostrar información de la petición recibida
router.use((req, res, next) => {
    console.log(new Date().toString(), "Método:", req.method,
        ", URL:", req.baseUrl);
    next();
});

let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "_" + file.originalname)
    }
})
let upload = multer({ storage: storage });

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

router.get('/new', (req, res) => {
    res.render('patient_add');
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

router.post('/', upload.single('image'), async (req, res) => {
    try {
        let newUser = new User({
            login: req.body.login,
            password: req.body.password
        });
        const userResult = await newUser.save();

        let newPatient = new Patient({
            _id: userResult._id,
            name: req.body.name,
            surname: req.body.surname,
            birthDate: req.body.birthDate,
            address: req.body.address,
            insuranceNumber: req.body.insuranceNumber,
            image: req.file ? req.file.path : null
        });

        const patientResult = await newPatient.save();
        res.redirect(req.baseUrl);
        /* res.status(201).send({ result: patientResult }); */
    } catch (error) {
        let errores = {
            general: 'Error insertando paciente'
        };
        if (error.errors.login) {
            errores.login = error.errors.login.message;
        }
        if (error.errors.password) {
            errores.password = error.errors.password.message;
        }
        if (error.errors.name) {
            errores.name = error.errors.name.message;
        }
        if (error.errors.surname) {
            errores.surname = error.errors.surname.message;
        }
        if (error.errors.birthDate) {
            errores.birthDate = error.errors.birthDate.message;
        }
        if (error.errors.address) {
            errores.address = error.errors.address.message;
        }
        if (error.errors.insuranceNumber) {
            errores.insuranceNumber = error.errors.insuranceNumber.message;
        }

        res.render('patient_add', { errores: errores, datos: req.body });
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