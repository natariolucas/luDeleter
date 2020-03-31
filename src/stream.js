const { twitterCredentials, idTwitterAccounts, twitterAccountsStatuses, tweetsStatuses, minutesToDelete } = require('./keys.js');
const { matchTweetCondition } = require('./lib/helpers.js');
const Twitter = require('twitter');
const pool = require('./database.js');
const sleep = ms => new Promise(res => setTimeout(res, ms));

var streamOn = false;
const stream = {
    clientsStream: {},
    async triggerTweet(clientAdmin,user, text, id_str) {
        const IdAccountApiTwitter = user.id;

        // Look for the twitter account, allowing to listen, and confirmed account
        const rows = await pool.query(`SELECT 
                                 Id, IdUser, MinutesToDelete, ReplyTweets
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

        if(rows[0].ReplyTweets === 1){
            var status = "[luDeleter BOT] This tweet has "+rows[0].MinutesToDelete+" minutes to live";
            console.log("# replied tweet");
            await clientAdmin.post('statuses/update', {status: status, in_reply_to_status_id: id_str}, async function (error, response) {
                if (error) console.log(error);

                var replyIdTweet = response.id_str;

                const newReply = {
                    IdUser: rows[0].IdUser,
                    IdUserTwitterAccountTweetFather: result.insertId,
                    IdUserTwitterAccount: rows[0].Id,
                    IdTweetApiTwitter: replyIdTweet,
                    Text: status,
                    IdStatus: tweetsStatuses.PENDING,
                    MinutesToDelete: rows[0].MinutesToDelete
                };

                await pool.query('INSERT INTO UsersTwitterAccountsTweets SET ?', [newReply]);

            });
        }
    },
    async startTweetChecker() {
        this.tweetChecker(true);
    },
    async tweetChecker(value) {
        var notFirst = false;
        while(value) {  // check forever
            if(notFirst)
                await sleep(3000);
            else
                notFirst = true;

            // Get all the tweets which has passed more or equal minutes since created until the parameter.
            // And those which are pending
            const rows = await pool.query(`SELECT * FROM (
                                            SELECT
                                                UTAT.Id,
                                                UTAT.IdTweetApiTwitter,
                                                UTA.Token,
                                                UTA.TokenSecret,
                                                TIMESTAMPDIFF(MINUTE,UTAT.CreatedAt, NOW()) AS MinutesSinceCreated,
                                                UTAT.MinutesToDelete
                                            FROM UsersTwitterAccountsTweets AS UTAT
                                            INNER JOIN UsersTwitterAccounts AS UTA
                                                ON
                                                    UTAT.IdUserTwitterAccount = UTA.Id
                                            WHERE UTAT.IdStatus = ? ) AS t1
                            WHERE
                            t1.MinutesSinceCreated >= MinutesToDelete`, [tweetsStatuses.PENDING]);

            if(rows.length < 1) {
                console.log('# No tweets to delete.');
                continue;
            }

            console.log("# tweets to delete.");
            // Deleting tweets.
            for (const item of rows) {

                var credentials = {
                    access_token_key: item.Token,
                    access_token_secret: item.TokenSecret,
                    consumer_key: twitterCredentials.consumer_key,
                    consumer_secret: twitterCredentials.consumer_secret
                };

                const clientAdmin = new Twitter(credentials);

                // Delete tweet via twitter API
                clientAdmin.post('statuses/destroy', {id: item.IdTweetApiTwitter}, async function (error, response) {
                    if (error) {
                        if(error[0].code === 144) {
                            await pool.query('UPDATE UsersTwitterAccountsTweets SET IdStatus = ? WHERE Id = ?', [tweetsStatuses.NOT_FOUND, item.Id])
                        }
                        console.log(error);
                    }
                });

                // Change status from database
                await pool.query('UPDATE UsersTwitterAccountsTweets SET IdStatus = ? WHERE Id = ?', [tweetsStatuses.DELETED_BY_MINUTES, item.Id])
            }
        }
    },
    async init() {
        const self = this;

        // Look for accounts to listen
        const rows = await pool.query(`SELECT 
                                 Id, IdUser, IdAccountApiTwitter, Token, TokenSecret
                            FROM UsersTwitterAccounts AS UTA 
                            WHERE
                                    UTA.AllowToListen = 1 AND 
                                    UTA.IdStatus = ?`, [twitterAccountsStatuses.CONFIRMED_ACCOUNT]);

        if(rows.length > 0 ) {
            rows.forEach((account) => {
                var credentials = {
                    access_token_key: account.Token,
                    access_token_secret: account.TokenSecret,
                    consumer_key: twitterCredentials.consumer_key,
                    consumer_secret: twitterCredentials.consumer_secret
                };

                const clientAdmin = new Twitter(credentials);

                // Initialize stream
                const stream = clientAdmin.stream('statuses/filter', {
                    follow: account.IdAccountApiTwitter
                });
                console.log('## Stream initialized');
                console.log('## Listening account: '+account.IdAccountApiTwitter);
                // Listen the tweets posted
                stream.on('data', async ({text, id_str, user}) => {
                  await self.triggerTweet(clientAdmin, user, text, id_str);
                });
                self.clientsStream[account.IdAccountApiTwitter] = stream;
            });

        }

        self.startTweetChecker();

    },
    async add(idAccountApiTwitter) {
        const self = this;
        if(self.clientsStream[idAccountApiTwitter])
            return false;

        // Look for accounts to listen
        const rows = await pool.query(`SELECT 
                                 Id, IdUser, IdAccountApiTwitter, Token, TokenSecret
                            FROM UsersTwitterAccounts AS UTA 
                            WHERE
                                    UTA.AllowToListen = 1 AND 
                                    UTA.IdStatus = ? AND 
                                    UTA.IdAccountApiTwitter = ?`, [twitterAccountsStatuses.CONFIRMED_ACCOUNT, idAccountApiTwitter]);
        if (rows.length < 1)
            return false;
        const account = rows[0];

        var credentials = {
            access_token_key: account.Token,
            access_token_secret: account.TokenSecret,
            consumer_key: twitterCredentials.consumer_key,
            consumer_secret: twitterCredentials.consumer_secret
        };

        const clientAdmin = new Twitter(credentials);

        // Initialize stream
        const stream = clientAdmin.stream('statuses/filter', {
            follow: idAccountApiTwitter
        });

        console.log('## added acount: ' + idAccountApiTwitter);

        // Listen the tweets posted
        stream.on('data', async ({text, id_str, user}) => {
            await self.triggerTweet(clientAdmin, user, text, id_str)
        });

        //add stream to object streams
        self.clientsStream[idAccountApiTwitter] = stream;
    },
    remove(idAccountApiTwitter) {
        const self = this;
        if(self.clientsStream[idAccountApiTwitter]) {
            self.clientsStream[idAccountApiTwitter].destroy();
            delete self.clientsStream[idAccountApiTwitter];
            console.log("## Removed account "+idAccountApiTwitter);
        }
    }
};

module.exports = stream;


