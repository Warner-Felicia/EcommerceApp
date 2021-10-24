const path = require('path');
const {
    body
} = require('express-validator');

const express = require('express');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

// /admin/add-product => GET
router.get('/add-product', isAuth, adminController.getAddProduct);

// // /admin/products => GET
router.get('/products', isAuth, adminController.getProducts);

// // /admin/add-product => POST
router.post('/add-product',
    [
        body('title', 'Please enter a title')
        .isString()
        .notEmpty()
        .trim(),
        body('author', 'Please enter an author')
        .isString()
        .notEmpty()
        .trim(),
        body('imageUrl', 'Please enter an imageUrl')
        .isURL()
        .notEmpty()
        .trim(),
        body('price', 'Please enter a price')
        .isFloat()
        .notEmpty()
        .trim(),
        body('summary', 'Please enter a summary')
        .isString()
        .notEmpty()
        .trim(),
    ],
    isAuth, adminController.postAddProduct);

router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

router.post('/edit-product',
    [
        body('title', 'Please enter a title')
        .isString()
        .notEmpty()
        .trim(),
        body('author', 'Please enter an author')
        .isString()
        .notEmpty()
        .trim(),
        body('imageUrl', 'Please enter an imageUrl')
        .isURL()
        .notEmpty()
        .trim(),
        body('price', 'Please enter a price')
        .isFloat()
        .notEmpty()
        .trim(),
        body('summary', 'Please enter a summary')
        .isString()
        .notEmpty()
        .trim(),
    ],
    isAuth, adminController.postEditProduct);

router.post('/delete-product', isAuth, adminController.postDeleteProduct);

module.exports = router;