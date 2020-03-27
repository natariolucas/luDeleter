const express = require('express');
const router = express.Router();
const {isLoggedIn} = require('../lib/auth.js');
const passport = require('passport');
const pool = require('../database.js');

router.get('/account/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;

    const tweets = await pool.query(`SELECT 
                                            UTA.Username,
                                            UTAT.Id, 
                                            UTAT.IdTweetApiTwitter, 
                                            UTATS.Name AS StatusName, 
                                            UTAT.CreatedAt, 
                                            UTAT.MinutesToDelete,
                                             DATE_ADD(UTAT.CreatedAt, INTERVAL UTAT.MinutesToDelete MINUTE) AS WillBeDeletedAt
                                        FROM
                                            UsersTwitterAccountsTweets AS UTAT
                                        INNER JOIN UsersTwitterAccountsTweetsStatuses AS UTATS
                                            ON
                                                UTAT.IdStatus = UTATS.Id
                                        INNER JOIN UsersTwitterAccounts AS UTA 
                                            ON 
                                                UTA.Id = UTAT.IdUserTwitterAccount
                                        WHERE UTAT.IdUserTwitterAccount = ?`, [id]);
    res.render('tweets/list.hbs', {tweets: tweets});
});

module.exports = router;