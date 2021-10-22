const express = require('express');
const {
    check, body
} = require('express-validator');

const authController = require('../controllers/auth');
const User = require('../models/user');

const router = express.Router();

router.get('/login', authController.getLogIn);

router.post('/login',
    [
    check('email')
        .isEmail()
        .withMessage('Please enter a valid email'),
    body (
        'password', 'Password is required to log in'
        )
        .notEmpty()
        .isAlphanumeric()

    ], 
    authController.postLogIn);

router.get('/signup', authController.getSignUp);

router.post('/signup', 
[
    body('firstName', 'First name is required')
        .trim()
        .notEmpty()
        .isString(),
    body('lastName', 'Last name is required')
        .trim()
        .notEmpty()
        .isString(),
    body('phoneNumber', 'Please enter a valid phone number')
        .blacklist('()-')
        .isNumeric(),
    body('streetAddress', 'Street address is required')
        .trim()
        .notEmpty()
        .isString(),
    body('city', 'City name is required')
        .trim()
        .notEmpty()
        .isString(),
    body('state', 'State name is required')
        .trim()
        .notEmpty()
        .isString(),
    body('zipCode', 'Zip Code is required')
        .trim()
        .notEmpty()
        .isAlphanumeric(),
    check('email')
        .isEmail()
        .withMessage('Please enter a valid email')
        .custom((value, { req }) => {
        return User.findOne({ email: value })
                .then(userDoc => {
                    if (userDoc) {
                        return Promise.reject('Email exists already, please pick a different one'
                        );
                    }
                });
        })
        .normalizeEmail(),
    body(
        'password',
        'Passwords must be at least 12 characters long and only use letters and numbers'
        )
        .isLength({ min: 12 })
        .isAlphanumeric()
        .trim(),
    body('confirmPassword')
        .trim()
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error("Passwords don't match");
            }
            return true;
        })
],
 authController.postSignUp);

router.post('/logout', authController.postLogOut);

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getNewPassword);

router.post('/newPassword', authController.postNewPassword);

module.exports = router;