const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const { applyEachSeries } = require('async');

const app = express();

const routes = require('./routes/main');

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(routes);

app.listen(5000);
