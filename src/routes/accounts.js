const express = require('express');
const router = express.Router();
const {isLoggedIn} = require('../lib/auth.js');

router.get('/', isLoggedIn, (req, res) => {
    res.render('accounts/list.hbs');
});

module.exports = router;