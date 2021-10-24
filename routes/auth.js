const express = require('express');
const {
    body
} = require('express-validator');
const bcrypt = require('bcryptjs');

const authController = require('../controllers/auth');
const User = require('../models/user');

const router = express.Router();

router.get('/login', authController.getLogIn);

router.post('/login',
    [
        body('email')
        .isEmail()
        .withMessage('Please enter a valid email')
        .normalizeEmail(),
        body(
            'password', 'Password is required to log in'
        )
        .notEmpty()
        .trim()
    ],
    authController.postLogIn);

router.get('/signup', authController.getSignUp);

router.post('/signup',
    [
        body('firstName', 'Please enter a valid first name')
        .trim()
        .notEmpty()
        .isString(),
        body('lastName', 'Please enter a valid last name')
        .trim()
        .notEmpty()
        .isString(),
        body('phoneNumber', 'Please enter a valid phone number')
        .blacklist('()-')
        .isNumeric()
        .trim(),
        body('streetAddress', 'Please enter a valid street address')
        .trim()
        .notEmpty()
        .isString(),
        body('city', 'Please enter a valid city name')
        .trim()
        .notEmpty()
        .isString(),
        body('state', 'Please enter a valid state name')
        .trim()
        .notEmpty()
        .isString(),
        body('zipCode', 'Please enter a valid zip code')
        .trim()
        .notEmpty()
        .isAlphanumeric(),
        body('email')
        .isEmail()
        .withMessage('Please enter a valid email')
        .custom((value, {
            req
        }) => {
            return User.findOne({
                    email: value
                })
                .then(userDoc => {
                    if (userDoc) {
                        return Promise.reject('Email exists already, please pick a different one');
                    }
                });
        })
        .normalizeEmail(),
        body(
            'password',
            'Passwords must be at least 12 characters long'
        )
        .isLength({
            min: 12
        })
        .trim(),
        body('confirmPassword')
        .trim()
        .custom((value, {
            req
        }) => {
            if (value !== req.body.password) {
                throw new Error("Passwords don't match");
            }
            return true;
        })
    ],
    authController.postSignUp);

router.post('/logout', authController.postLogOut);

router.get('/reset', authController.getReset);

router.post('/reset',
    body('email')
    .isEmail()
    .withMessage('Please enter a valid email')
    .custom((value, {
        req
    }) => {
        return User.findOne({
                email: value
            })
            .then(userDoc => {
                if (!userDoc) {
                    return Promise.reject('There is no account associated with that email');
                }
            });
    })
    .normalizeEmail(), 
    authController.postReset);

router.get('/reset/:token', authController.getNewPassword);

router.post('/newPassword',
    [
        body('oldPassword')
        .isLength({
            min: 12
        })
        .withMessage('Passwords must be at least 12 characters long')
        .trim(),
        body('newPassword')
        .isLength({
            min: 12
        })
        .withMessage('Passwords must be at least 12 characters long')
        .trim(),
        body('confirmNewPassword')
        .custom((value, {
            req
        }) => {
            if (value !== req.body.newPassword) {
                throw new Error("Passwords don't match");
            }
            return true;
        })
        .trim()
    ],
    authController.postNewPassword);

module.exports = router;