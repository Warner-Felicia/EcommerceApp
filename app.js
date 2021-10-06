const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');

const express = require('express');
const bodyParser = require('body-parser');

const errorController = require('./controllers/error');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

const corsOptions = {
    origin: "https://ecommerceappfw.herokuapp.com/",
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

const options = {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    family: 4
};

const MONGODB_URL = process.env.MONGODB_URL || "mongodb+srv://foodles:q61iUB0qfaRSZPAp@cluster0.6dqnd.mongodb.net/shop?retryWrites=true&w=majority";

mongoose
  .connect(
    MONGODB_URL, options
  )
  .then(result => {
    console.log('hello');
    app.listen(PORT);
  })
  .catch(err => {
    console.log(err);
  });
