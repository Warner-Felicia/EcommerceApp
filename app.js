const path = require('path');
// const cors = require('cors');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const errorController = require('./controllers/error');
const User = require('./models/user');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  User.findById('6161bc251d1a4d365103f2f8')
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

// const corsOptions = {
//     origin: "https://ecommerceappfw.herokuapp.com/",
//     optionsSuccessStatus: 200
// };
// app.use(cors(corsOptions));

// const options = {
//     useUnifiedTopology: true,
//     useNewUrlParser: true,
//     useCreateIndex: true,
//     useFindAndModify: false,
//     family: 4
// };

// const MONGODB_URL = process.env.MONGODB_URL || "mongodb+srv://foodles:q61iUB0qfaRSZPAp@cluster0.6dqnd.mongodb.net/shop?retryWrites=true&w=majority";

mongoose.connect('mongodb+srv://foodles:q61iUB0qfaRSZPAp@cluster0.woawi.mongodb.net/ecommerce?retryWrites=true&w=majority')
  .then(result => {
    User.findOne()
      .then(user => {
        if (!user) {
          const user = new User({
            username: 'Foodles',
            email: 'foodleswarner@gmail.com',
            phoneNumber: 9194613928,
            address: '931 Vance Street, Roanoke Rapids, NC 17526',
            cart: {
              items: []
            }
          });
          user.save();
        }
        
      })
      .catch(err => console.log(err));


    app.listen(5000);
  })
  .catch(err => {
    console.log(err);
  });