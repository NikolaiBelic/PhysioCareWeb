const express = require('express');
const multer = require('multer');

let Physio = require(__dirname + '/../models/physio.js');
let User = require(__dirname + '/../models/user.js');

let router = express.Router();

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
        res.redirect('/auth/login');
    }
}

let rol = (rol) => {
    return (req, res, next) => {
        if (rol === req.session.rol)
            next();
        else
            res.render('/auth/login');
    }
}

router.get('/', autenticacion, rol('admin'), rol('physio'), (req, res) => {
    Physio.find().then(resultado => {
        res.render('physios_list', { physios: resultado });
    }).catch(error => {
        res.render('error', { error: 'Error listando fisios' });
    });
});

router.get('/find', (req, res) => {
    let specialty = req.query.specialty ? { specialty: { $regex: req.query.specialty, $options: 'i' } } : {};

    Physio.find(specialty).then(result => {
        if (result.length > 0) {
            res.render('physios_list', { physios: result });
        } else {
            res.render('error', { error: "No se encontraron pacientes asociados a la especialidad ingresada." });
        }
    }).catch(error => {
        res.render('error', { error: "Hubo un problema al procesar la búsqueda. Inténtelo más tarde." });
    });
});

router.get('/new', (req, res) => {
    res.render('physio_add');
});

router.get('/:id', (req, res) => {
    Physio.findById(req.params.id).then(result => {
        if (result)
            res.render('physio_detail', { physio: result });
        else
            res.render('error', { error: "Physio no encontrado" });
    }).catch(error => {
    });
});

// contraseña, delete, posts, 

router.post('/', upload.single('image'), async (req, res) => {
    try {
        let newUser = new User({
            login: req.body.login,
            password: req.body.password,
            rol: 'physio'
        });
        const userResult = await newUser.save();

        let newPhysio = new Physio({
            _id: userResult._id,
            name: req.body.name,
            surname: req.body.surname,
            specialty: req.body.specialty,
            licenseNumber: req.body.licenseNumber,
            image: req.file ? req.file.filename : null
        });

        const physioResult = await newPhysio.save();
        res.redirect(req.baseUrl);
    } catch (error) {
        let errores = {
            general: 'Error insertando fisio'
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
        if (error.errors.specialty) {
            errores.specialty = error.errors.specialty.message;
        }
        if (error.errors.licenseNumber) {
            errores.licenseNumber = error.errors.licenseNumber.message;
        }

        res.render('physio_add', { errores: errores, datos: req.body });
    }
});

router.get('/:id/edit', (req, res) => {
    Physio.findById(req.params.id).then(result => {
        if (result)
            res.render('physio_edit', { physio: result });
        else
            res.render('error', { error: "Fisio no encontrado" });
    }).catch(error => {
    });
});

// MÉTODO POST PARA ACTUALIZAR UN FISIO
router.post('/:id', upload.single('image'), (req, res) => {
    Physio.findById(req.params.id).then(existingPhysio => {
        if (!existingPhysio) {
            throw new Error('Fisio no encontrado');
        }

        return Physio.findByIdAndUpdate(req.params.id, {
            $set: {
                name: req.body.name,
                surname: req.body.surname,
                specialty: req.body.specialty,
                licenseNumber: req.body.licenseNumber,
                image: req.file ? req.file.filename : existingPhysio.image
            }
        }, { new: true, runValidators: true });
    }).then(result => {
        res.redirect('/physios/' + req.params.id);
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
        if (error.errors.specialty) {
            errores.specialty = error.errors.specialty.message;
        }
        if (error.errors.licenseNumber) {
            errores.licenseNumber = error.errors.licenseNumber.message;
        }

        res.render('physio_edit', { errores: errores, physio: req.body });
    });
});

router.delete('/:id', (req, res) => {
    Physio.findByIdAndDelete(req.params.id)
        .then(resultado => {
            if (resultado) {
                res.status(200)
                    .send({ result: resultado });
            }
            else {
                res.status(404)
                    .send({ error: "No existe el fisio a eliminar" })
            }
        }).catch(error => {
            res.status(500)
                .send({
                    error: "Error interno del servidor"
                });
        });
});

module.exports = router;