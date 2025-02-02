const express = require('express');
const multer = require('multer');

const saltRounds = 10;

let Patient = require(__dirname + '/../models/patient.js');
let Record = require(__dirname + '/../models/record.js');
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

let autenticacion = (req, res, next) => {
    if (req.session && req.session.userId) {
        next();
    } else {
        res.render('error', { error: 'No tiene permisos para acceder a esta página' });
    }
}

let rol = (rol) => {
    return (req, res, next) => {
        if (rol.includes(req.session.rol)) {
            next();
        } else {
            res.render('error', { error: 'No tiene permisos para acceder a esta página' });
        }
    }
}

router.get('/', autenticacion, rol(['admin', 'physio']), (req, res) => {
    Patient.find().then(resultado => {
        res.render('patients_list', { patients: resultado });
    }).catch(error => {
        res.render('error', { error: 'Error listando pacientes' });
    });
});

router.get('/find', autenticacion, rol(['admin', 'physio']), (req, res) => {
    let surname = req.query.surname ? { surname: { $regex: req.query.surname, $options: 'i' } } : {};

    Patient.find(surname).then(result => {
        if (result.length > 0) {
            res.render('patients_list', { patients: result });
        } else {
            res.render('error', { error: "No se encontraron pacientes asociados al apellido ingresado." });
        }
    }).catch(error => {
        res.render('error', { error: "Hubo un problema al procesar la búsqueda. Inténtelo más tarde." });
    });
});

router.get('/new', autenticacion, rol(['admin', 'physio']), (req, res) => {
    res.render('patient_add');
});

router.get('/:id', autenticacion, rol(['admin', 'physio', 'patient']), (req, res) => {
    Patient.findById(req.params.id).then(patient => {
        if (!patient) {
            return res.render('error', { error: 'Paciente no encontrado' });
        }

        Record.findOne({ patient: patient._id }).then(record => {
            if (!record) {
                return res.render('error', { error: 'Expediente no encontrado' });
            }

            if (req.session.rol === 'admin' || req.session.rol === 'physio') {
                res.render('patient_detail', { patient: patient, record: record });
            } else if (req.session.rol === 'patient' && req.session.userId.toString() === patient._id.toString()) {
                res.render('patient_detail', { patient: patient, record: record });
            } else {
                res.render('error', { error: 'No tiene permisos para acceder a esta página' });
            }
        }).catch(error => {
            res.render('error', { error: 'Error buscando expediente' });
        });
    }).catch(error => {
        res.render('error', { error: 'Error buscando paciente' });
    });
});

router.post('/', autenticacion, rol(['admin', 'physio']), upload.single('image'), async (req, res) => {
    try {
        let newUser = new User({
            login: req.body.login,
            password: req.body.password,
            rol: 'patient'
        });
        const userResult = await newUser.save();

        let newPatient = new Patient({
            _id: userResult._id,
            name: req.body.name,
            surname: req.body.surname,
            birthDate: req.body.birthDate,
            address: req.body.address,
            insuranceNumber: req.body.insuranceNumber,
            image: req.file ? req.file.filename : null
        });

        const patientResult = await newPatient.save();
        res.redirect(req.baseUrl);
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

router.get('/:id/edit', autenticacion, rol(['admin', 'physio']), (req, res) => {
    Patient.findById(req.params.id).then(result => {
        if (result)
            res.render('patient_edit', { patient: result });
        else
            res.render('error', { error: "Paciente no encontrado" });
    }).catch(error => {
    });
});

// MÉTODO PARA ACTUALIZAR UN PACIENTE CON POST
router.post('/:id', autenticacion, rol(['admin', 'physio']), upload.single('image'), (req, res) => {
    Patient.findById(req.params.id).then(existingPatient => {
        if (!existingPatient) {
            throw new Error('Paciente no encontrado');
        }

        return Patient.findByIdAndUpdate(req.params.id, {
            $set: {
                name: req.body.name,
                surname: req.body.surname,
                birthDate: req.body.birthDate,
                address: req.body.address,
                insuranceNumber: req.body.insuranceNumber,
                image: req.file ? req.file.filename : existingPatient.image
            }
        }, { new: true, runValidators: true });
    }).then(result => {
        res.redirect('/patients/' + req.params.id);
    }).catch(error => {
        let errores = {
            general: 'Error actualizando paciente'
        };
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

        res.render('patient_edit', { errores: errores, patient: req.body });
    });
});

router.delete('/:id', autenticacion, rol(['admin', 'physio']), (req, res) => {
    Patient.findByIdAndDelete(req.params.id).then(resultado => {
        res.redirect(req.baseUrl);
    }).catch(error => {
        res.render('error', { error: "Error borrando paciente" });
    });
});

module.exports = router;