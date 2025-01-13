const mongoose = require('mongoose');
const express = require('express');
const nunjucks = require('nunjucks');
const methodOverride = require('method-override');

mongoose.set('strictQuery', true);

const patients = require(__dirname + "/routes/patients");
const physios = require(__dirname + "/routes/physios");
const records = require(__dirname + "/routes/records");
const users = require(__dirname + "/routes/users");

mongoose.connect('mongodb://127.0.0.1:27017/physiocare');

let app = express();

nunjucks.configure('views', {
    autoescape: true,
    express: app
});

app.set('view engine', 'njk');

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      let method = req.body._method;
      delete req.body._method;
      return method;
    } 
}));
app.use('/public', express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/node_modules/bootstrap/dist'));
app.use('/patients', patients);
app.use('/physios', physios);
app.use('/records', records);
app.use('/users', users);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.listen(8081);

// result en vez de result
// quitar todos los ok
// mismo servicio post de paciente y fisio se crea el usuario y se le añade al paciente el id de ese usuario