require('dotenv').config();
module.exports = {
    database: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB
    },
    twitterCredentials: {
        consumer_key: process.env.CONSUMER_KEY,
        consumer_secret: process.env.CONSUMER_SECRET,
    },
    idTwitterAccounts: {
        Lucas: 1891919095
    },
    twitterAccountsStatuses: {
        CONFIRMED_ACCOUNT: 1,
        NOT_CONFIRMED_ACCOUNT: 2
    },
    tweetsStatuses: {
      PENDING: 1,
      DELETED_BY_MINUTES: 2
    },
    statuses: {
        ACTIVE: 10,
        NO_ACTIVE: 30,
        DELETED: 90
    },
    minutesToDelete: 1,
    delimiterRegexp: /^\$\s/
};