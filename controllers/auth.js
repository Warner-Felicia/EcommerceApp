const {
    validationResult
} = require('express-validator');

const crypto = require('crypto');

const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');

const User = require('../models/user');
const sendgridApiKey = process.env.SENDGRID_API_KEY;

const transporter = nodemailer.createTransport(sendgridTransport({
    auth: {
        api_key: sendgridApiKey
    }
}));

exports.getLogIn = (req, res, next) => {
    res.render('auth/login', {
        pageTitle: 'Log In',
        path: '/auth/login',
        errorMessage: req.flash('error'),
        oldInput: {
            email: ''
        },
        validationErrors: []
    });
};

exports.postLogIn = (req, res, next) => {
    let email = req.body.email;
    const password = req.body.password;
    const errors = validationResult(req);

    if (email === '@') {
        email = '';
    }
    
    if (!errors.isEmpty()) {
        console.log('here too');
        return res.status(422).render('auth/login', {
            pageTitle: 'Log In',
            path: '/login',
            errorMessage: errors.array()[0].msg,
            oldInput: {
                email: email
            },
            validationErrors: errors.array()
        });
    }

    User.findOne({
            email: email
        })
        .then(user => {
            if (!user) {
                req.flash('error', 'There is no account for that email. Please create an account');
                return res.redirect('/login');
            }
            bcrypt.compare(password, user.password)
                .then(matchBoolean => {
                    if (matchBoolean) {
                        req.session.isLoggedIn = true;
                        req.session.user = user;
                        return req.session.save(err => {
                            console.log(err);
                            res.redirect('/');
                        });
                    }
                    return res.status(422).render('auth/login', {
                        pageTitle: 'Log In',
                        path: '/login',
                        errorMessage: 'Invalid email',
                        oldInput: {
                            email: email
                        },
                        validationErrors: []
                    });
                })
                .catch(err => {
                    res.redirect('/login');
                });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
          });
};

exports.getSignUp = (req, res, nexgt) => {
    res.render('auth/signup', {
        pageTitle: 'Sign Up',
        path: '/signup',
        errorMessage: req.flash('error'),
        oldInput: {
            firstName: '',
            lastName: '',
            phoneNumber: '',
            streetAddress: '',
            city: '',
            state: '',
            zipCode: ''
        },
        validationErrors: []
    });
};

exports.postSignUp = (req, res, next) => {
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const phoneNumber = req.body.phoneNumber;
    const streetAddress = req.body.streetAddress;
    const city = req.body.city;
    const state = req.body.state;
    const zipCode = req.body.zipCode;
    let email = req.body.email;
    const password = req.body.password;
    const errors = validationResult(req);

    if (email === '@') {
        email = '';
    }
    if (!errors.isEmpty()) {
        return res.status(422).render('auth/signup', {
            pageTitle: 'Sign Up',
            path: '/signup',
            errorMessage: errors.array()[0].msg,
            oldInput: {
                firstName: firstName,
                lastName: lastName,
                phoneNumber: phoneNumber,
                streetAddress: streetAddress,
                city: city,
                state: state,
                zipCode: zipCode,
                email: email
            },
            validationErrors: errors.array()
        });
    }
    bcrypt.hash(password, 12)
        .then(hashedPassword => {
            const user = new User({
                firstName: firstName,
                lastName: lastName,
                phoneNumber: phoneNumber,
                streetAddress: streetAddress,
                city: city,
                state: state,
                zipCode: zipCode,
                email: email,
                password: hashedPassword,
                cart: {
                    items: []
                }
            });
            return user.save();
        })
        .then(result => {
            res.redirect('/login');
            return transporter.sendMail({
                to: email,
                from: 'fwarner@byui.edu',
                subject: 'Signup Suceeded',
                html: '<h1>Thank you for signing up.</h1>'
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
          });
};


exports.postLogOut = (req, res, next) => {
    req.session.destroy();
    res.redirect('/');
};

exports.getReset = (req, res, next) => {
    res.render('auth/reset', {
        pageTitle: 'Password Reset',
        path: '/reset',
        errorMessage: req.flash('error')
    });
};

exports.postReset = (req, res, next) => {
    const email = req.body.email;
    const errors = validationResult(req);
    let token;

    if (!errors.isEmpty()) {
        return res.status(422).render('auth/reset', {
            pageTitle: 'Reset Password',
            path: '/reset',
            errorMessage: errors.array()[0].msg,
            oldInput: {
                email: email
            },
            validationErrors: errors.array()
        });
    }

    User.findOne({
            email: email
        })
        .then(user => {
            if (!user) {
                return res.redirect('/reset');
            }
            crypto.randomBytes(32, (err, buff) => {
                if (err) {
                    console.log(err);
                    return res.redirect('/reset');
                }
                token = buff.toString('hex');
                const tokenExpiration = Date.now() + 3600000;
                user.token = token;
                user.tokenExpiration = tokenExpiration;
                return user.save();
            });
        })
        .then(result => {
            console.log(req.user);
            res.redirect('/');
            return transporter.sendMail({
                to: email,
                from: 'fwarner@byui.edu',
                subject: 'Password Rest',
                html: `<p>Please click this <a href="http://localhost:5000/reset/${token}"> link </a> to reset your password</p>
                <p>This link will only be valid for one hour</p>`

            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
          });
};

exports.getNewPassword = (req, res, next) => {
    const token = req.params.token;
    User.findOne({
            token: token,
            tokenExpiration: {
                $gt: Date.now()
            }
        })
        .then(user => {
            if (!user) {
                return res.redirect('/');
            }
            return res.render('auth/newPassword', {
                pageTitle: 'Password Reset',
                path: '/reset',
                errorMessage: '',
                userId: user._id,
                token: token,
                validationErrors: []
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
          });

};

exports.postNewPassword = (req, res, next) => {
    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;
    const userId = req.body.userId;
    const token = req.body.token;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).render('auth/newPassword', {
            pageTitle: 'Password Reset',
            path: '/newPassword',
            userId: userId,
            token: token,
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array()
        });
    }
    User.findOne({
            _id: userId
        })
        .then(user => {
            bcrypt.compare(oldPassword, user.password)
                .then(matchBoolean => {
                    if (matchBoolean) {
                        return user;
                    }
                    req.flash('error', 'Invalid old password');
                    return res.render('auth/newPassword', {
                        pageTitle: 'Password Reset',
                        path: '/reset',
                        errorMessage: req.flash('error'),
                        userId: user._id,
                        token: token,
                        validationErrors: errors.array()
                    });

                })
                .then(user => {
                    bcrypt.hash(newPassword, 12)
                        .then(hashedPassword => {
                            user.password = hashedPassword;
                            user.token = null;
                            user.tokenExpiration = null;
                            user.save();
                        })
                        .catch(err => {
                            const error = new Error(err);
                            error.httpStatusCode = 500;
                            return next(error);
                          });
                })
                .then(result => {
                    res.redirect('login');
                })
                .catch(err => {
                    const error = new Error(err);
                    error.httpStatusCode = 500;
                    return next(error);
                  });
        })

        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
          });
};