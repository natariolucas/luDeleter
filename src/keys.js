module.exports = {
    database: {
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'dev_links'
    },
    twitterCredentials: {
        consumer_key: 'rmTC6s8kJblotO3dIqeSjkALU',
        consumer_secret: '9n96i8YrVy1ROvSNnstNnLJ3epRnEDBLVjSZIYZ5LI0Xhcpif3',
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