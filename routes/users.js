const express = require('express');
const bcrypt = require('bcrypt');

let User = require(__dirname + '/../models/user.js');

let router = express.Router();

router.get('/', (req, res) => {
    User.find(req.params.id).then(result => {
        if (result)
            res.status(200)
                .send({ result: result });
        else
            res.status(404)
                .send({
                    error: "No hay usuarios en el sistema"
                });
    }).catch(error => {
        res.status(500)
            .send({
                error: "Error interno del servidor"
            });
    });
});

router.post('/', async (req, res) => {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    let newUser = new User({
        login: req.body.login,
        password: hashedPassword,
        rol: req.body.rol
    });
    newUser.save().then(result => {
        res.status(201)
            .send({ result: result });
    }).catch(error => {
        res.status(400)
            .send({
                error: "Error añadiendo usuario"
            });
    });
});

router.delete('/:id', (req, res) => {
    User.findByIdAndDelete(req.params.id)
        .then(result => {
            if (result) {
                res.status(200)
                    .send({ result: result });
            }
            else {
                res.status(404)
                    .send({ error: "No existe el usuario a eliminar" })
            }
        }).catch(error => {
            res.status(500)
                .send({
                    error: "Error interno del servidor"
                });
        });
});

module.exports = router;