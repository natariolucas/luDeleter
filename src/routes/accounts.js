const express = require('express');
const router = express.Router();
const {isLoggedIn} = require('../lib/auth.js');
const passport = require('passport');
const pool = require('../database.js');
const stream = require('../stream.js');

router.get('/', isLoggedIn, async (req, res) => {
    const accounts = await pool.query('SELECT * FROM UsersTwitterAccounts AS UTA WHERE UTA.IdUser = ?', [req.user.Id]);
    res.render('accounts/list.hbs', {accounts: accounts});
});

router.get('/edit/:id', isLoggedIn, async (req, res) => {
    const {id} = req.params;
    const account = await pool.query('SELECT * FROM UsersTwitterAccounts AS UTA WHERE UTA.Id = ?', [id]);

    account[0].AllowToListen = account[0].AllowToListen === 1 ? "checked" : "";
    account[0].ReplyTweets = account[0].ReplyTweets === 1 ? "checked" : "";

    res.render('accounts/edit.hbs', {account: account[0]});
});

router.post('/edit/:id', isLoggedIn, async (req, res) => {

    const { id } = req.params;
    const AllowToListen = (req.body.allowToListen === 'on') ? 1 : 0;
    const ReplyTweets = (req.body.replyTweets === 'on') ? 1 : 0;
    const updatedAccount = {
        MinutesToDelete: req.body.minutesToDelete,
        AllowToListen: AllowToListen,
        ReplyTweets: ReplyTweets
    };

    const rows = await pool.query('SELECT Id, IdAccountApiTwitter, AllowToListen FROM UsersTwitterAccounts WHERE Id = ?', [id]);

    await pool.query('UPDATE UsersTwitterAccounts SET ? WHERE Id = ?', [updatedAccount, id]);

    //Si hay diferencia en el AllowToListen
    if(rows.AllowToListen !== AllowToListen) {
        var idAccountApiTwitter = rows[0].IdAccountApiTwitter;
       if(updatedAccount.AllowToListen === 1 && !stream.clientsStream[idAccountApiTwitter]) {
           await stream.add(idAccountApiTwitter)
       }

        if(updatedAccount.AllowToListen === 0 && stream.clientsStream[rows[0].IdAccountApiTwitter]) {
            stream.remove(idAccountApiTwitter);
        }
    }

    res.redirect('/accounts');
});

router.get('/add', isLoggedIn, passport.authenticate('twitter.signin'));

router.get('/add/return', isLoggedIn, passport.authenticate('twitter.signin', {
    failureRedirect: '/'
}), function(req, res) {
    res.redirect('/')
});

module.exports = router;