const express = require('express');
const app = express();
const path = require('path');
const cookieParser = require('cookie-parser');

const db = require('./database/connexion');
db.connexion();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

const index = require('./routes/index');
app.use('/', index);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

app.listen(3000, () => console.log('Server started: 3000'));