const mongoose = require('mongoose');
const express = require('express');
const session = require('express-session');
const nunjucks = require('nunjucks');
const dateFilter = require('nunjucks-date-filter');
const methodOverride = require('method-override');


mongoose.set('strictQuery', true);

const patients = require(__dirname + "/routes/patients");
const physios = require(__dirname + "/routes/physios");
const records = require(__dirname + "/routes/records");
const auth = require(__dirname + "/routes/auth");
const users = require(__dirname + "/routes/users");

mongoose.connect('mongodb://mymongodb:27017/physiocare');

let app = express();

nunjucks.configure('views', {
    autoescape: true,
    express: app
}).addFilter('date', dateFilter);

app.set('view engine', 'njk');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: '1234',
    resave: true,
    saveUninitialized: false,
    expires: new Date(Date.now() + (30 * 60 * 1000))
}));
app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
});
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
app.use('/auth', auth);
app.use('/users', users);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/home', (req, res) => {
    res.render('home');
});

app.listen(8080);

