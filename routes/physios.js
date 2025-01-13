const express = require('express');
const bcrypt = require('bcrypt');

let Physio = require(__dirname + '/../models/physio.js');
let router = express.Router();

router.get('/', (req, res) => {
    Physio.find().then(resultado => {
        res.render('physios_list', { physios: resultado });
    }).catch(error => {
        res.render('error', { error: 'Error listando fisios' });
    });
});

router.get('/find', (req, res) => {
        Physio.find({ 
            specialty: { $regex: new RegExp(`^${req.query.specialty}$`), $options: 'i' } }).then(resultado => {
            if (resultado.length > 0)
                res.status(200)
                    .send({ result: resultado });
            else {
                    res.status(404).send({
                        error: "No se han encontrado fisios con esos criterios"
                    });
                }
        }).catch(error => {
            res.status(500)
                .send({
                    error: "Error interno del servidor"
                });
        });
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

router.post('/', async (req, res) => {
    try {
        let newPhysio = new Physio({
            name: req.body.name,
            surname: req.body.surname,
            specialty: req.body.specialty,
            licenseNumber: req.body.licenseNumber
        });
        const physioResult = await newPhysio.save();
        res.status(201).send({ result: physioResult });
    } catch (error) {
        console.error("Error guardando el fisio:", error);
        res.status(500).send({
            error: "Error interno del servidor"
        });
    }
});

/* router.post('/', (req, res) => {
    let newPhysio = new Physio({
        name: req.body.name,
        surname: req.body.surname,
        specialty: req.body.specialty,
        licenseNumber: req.body.licenseNumber
    });
    newPhysio.save().then(resultado => {
        res.status(201)
            .send({ ok: true, resultado: resultado });
    }).catch(error => {
        res.status(400)
            .send({
                ok: false,
                error: "Error añadiendo fisio"
            });
    });
}); */

router.put('/:id', (req, res) => {
    Physio.findByIdAndUpdate(req.params.id, {
        $set: {
            name: req.body.name,
            surname: req.body.surname,
            specialty: req.body.specialty,
            licenseNumber: req.body.licenseNumber
        }
    }, { new: true, runValidators: true }).then(resultado => {
        if (resultado) {
            res.status(200)
                .send({ result: resultado });
        }
        else {
            res.status(400)
                .send({ error: "Error actualizando los datos del fisio" })
        }
    }).catch(error => {
        res.status(500)
            .send({
                error: "Error interno del servidor"
            });
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