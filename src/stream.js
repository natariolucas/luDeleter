const { twitterCredentials, idTwitterAccounts, twitterAccountsStatuses, tweetsStatuses, minutesToDelete } = require('./keys.js');
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

    // Listen the tweets posted
    stream.on('data', async ({text, id_str, user}) => {
        const IdAccountApiTwitter = user.id;

        // Look for the twitter account, allowing to listen, and confirmed account
        const rows = await pool.query(`SELECT 
                                 Id, IdUser, MinutesToDelete
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
            IdStatus: tweetsStatuses.PENDING,
            MinutesToDelete: rows[0].MinutesToDelete
        };

        const result = await pool.query('INSERT INTO UsersTwitterAccountsTweets SET ?', [newTweet]);
        console.log('# Inserted Tweet (Id: '+result.insertId+') - (IdTweetApi: '+ newTweet.IdTweetApiTwitter +') - (IdUser: '+newTweet.IdUser+')');
    });

    // Check for tweets to delete
    const sleep = ms => new Promise(res => setTimeout(res, ms));

    (async function() {
        while(true) {  // check forever
            await sleep(3000);

            // Get all the tweets which has passed more or equal minutes since created until the parameter.
            // And those which are pending
            const rows = await pool.query(`SELECT * FROM (
                                        SELECT 
                                            Id, 
                                            IdTweetApiTwitter, 
                                            TIMESTAMPDIFF(MINUTE,CreatedAt, NOW()) AS MinutesSinceCreated, 
                                            MinutesToDelete
                                        FROM UsersTwitterAccountsTweets
                                        WHERE IdStatus = ? ) AS t1
                        WHERE 
                        t1.MinutesSinceCreated >= MinutesToDelete`, [tweetsStatuses.PENDING]);

            if(rows.length < 1) {
                console.log('# No tweets to delete.');
                continue;
            }

            console.log("# tweets to delete.");
            // Deleting tweets.
            for (const item of rows) {
                // Delete tweet via twitter API
                client.post('statuses/destroy', {id: item.IdTweetApiTwitter}, function (error, response) {
                    if (error) console.log(error);
                });

                // Change status from database
                const result = await pool.query('UPDATE UsersTwitterAccountsTweets SET IdStatus = ? WHERE Id = ?', [tweetsStatuses.DELETED_BY_MINUTES, item.Id])
            }
        }
    })();

};

module.exports = stream;


