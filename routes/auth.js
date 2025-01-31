const express = require('express');
const User = require(__dirname + '/../models/user.js');
const router = express.Router();


// Servicio GET /auth/login: muestra el formulario de login
router.get('/login', (req, res) => {
    res.render('login');
});

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

router.post('/login', (req, res) => {
    let login = req.body.login;
    let password = req.body.password;

    User.findOne({ login: login }).then(user => {
        if (!user) {
            return res.render('login', { error: 'Usuario no encontrado' });
        }

        if (password === user.password) {
            req.session.userId = user._id;
            req.session.login = user.login;
            req.session.rol = user.rol;
            res.redirect('/patients');
        } else {
            res.render('login', { error: 'Contraseña incorrecta' });
        }
    }).catch(err => {
        res.render('login', { error: 'Error al buscar usuario' });
    });
});

module.exports = router;