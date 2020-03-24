const { twitterCredentials, idTwitterAccounts, twitterAccountsStatuses, statuses } = require('./keys.js');
const { matchTweetCondition } = require('./lib/helpers.js');
const Twitter = require('twitter');
const pool = require('./database.js');


const stream = {};
stream.init = () => {

    // Auth with twitter API
    const client = new Twitter(twitterCredentials);

    // Initialize stream
    const stream = client.stream('statuses/filter', {
        follow: idTwitterAccounts.Lucas
    });
    console.log('## Stream initialized');

    // Listen the tweet
    stream.on('data', async ({text, id_str, user}) => {
        const IdAccountApiTwitter = user.id;

        // Look for the twitter account, allowing to listen, and confirmed account
        const rows = await pool.query(`SELECT 
                                 Id, IdUser 
                            FROM UsersTwitterAccounts AS UTA 
                            WHERE
                                    UTA.IdAccountApiTwitter = ? AND 
                                    UTA.AllowToListen = 1 AND 
                                    UTA.IdStatus = ?`, [IdAccountApiTwitter, twitterAccountsStatuses.CONFIRMED_ACCOUNT]);

        // Verify that the account exists and its a unique account.
        if(rows.length !== 1) {
            console.log('# The account '+IdAccountApiTwitter+' doesnt allow to listen');
            return;
        }

        // Verify that the tweet match the condition so its a story tweet.
        if(!matchTweetCondition(text)) {
            console.log('# The tweet ('+id_str+') text doesnt match the text condition');
            return;
        }

        //Insert a newTweet
        const newTweet = {
            IdUser: rows[0].IdUser,
            IdUserTwitterAccount: rows[0].Id,
            IdTweetApiTwitter: id_str,
            Text: text,
            Status: statuses.ACTIVE
        };

        const result = await pool.query('INSERT INTO UsersTwitterAccountsTweets SET ?', [newTweet]);
        console.log('# Inserted Tweet (Id: '+result.insertId+') - (IdTweetApi: '+ newTweet.IdTweetApiTwitter +') - (IdUser: '+newTweet.IdUser+')');
    });

};

module.exports = stream;


