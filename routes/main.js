const express = require('express');
const router = express.Router();

const products = [];

router.get('/', (req, res, next) => {
    res.render('index', {
        docTitle: "Shop",
        path: '/',
        products: products
    });
});

router.get('/add-product', (req, res, next) => {
    res.render('add-product', {
        docTitle: 'Add Product',
        path: '/add-product'
    });
});

router.post('/add-product', (req, res, next) => {
    const title = req.body.title;
    const imageSource = req.body.imageSource;
    const price = req.body.price;
    const description = req.body.description;
    products.push({
        'title': title,
        'imageSource': imageSource,
        'price': price,
        'description': description
    });
    res.redirect('/');
});

router.post('/delete-product', (req, res, next) => {
    const title = req.body.title;
    const index = products.findIndex(product => {
        return product.title === title;
    });
    if (index >= 0) {
        products.splice(index, 1);
    }
    res.redirect('/');
});

module.exports = router;