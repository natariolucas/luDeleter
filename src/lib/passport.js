const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;
const pool = require('../database');
const helpers = require('../lib/helpers');
const { twitterCredentials } = require('../keys');

passport.use('local.signin', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, username, password, done) => {
    const rows = await pool.query('SELECT * FROM Users WHERE Username = ?', [username]);

    if(rows.length > 0) {
        const user = rows[0];
        const validPassword = await helpers.matchPassword(password, user.Password);
        if(validPassword) return done(null, user, req.flash('exito', 'Welcome' + user.Username));
        else return done(null, false, req.flash('fallo', 'Incorrect username or password'))
    } else {
        return done(null, false, req.flash('fallo', 'Incorrect username or password'))
    }
}));

passport.use('local.signup', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, username, password, done) => {
    const rows = await pool.query("SELECT * FROM Users WHERE Username = ?", [username]);

    if(rows.length > 0 ){
        return done(null, false, req.flash('fallo', 'Username already in use'));
    }

    const newUser = {
        Username: username,
        Password : await helpers.encryptPassword(password),
        Fullname: req.body.fullname
    };

    const result = await pool.query("INSERT INTO Users SET ?", newUser);

    newUser.Id = result.insertId;
    return done(null, newUser); //Ejecuta luego el success o failure del objeto passport
}));

passport.use('twitter.signin', new TwitterStrategy({
    consumerKey: twitterCredentials.consumer_key,
    consumerSecret: twitterCredentials.consumer_secret,
    callBackUrl: '/profile',
    passReqToCallback: true
}, async (req, token, tokenSecret, profile, done) => {
    // Check if the twitter account already exists
    const rowsValidation = await pool.query("SELECT * FROM UsersTwitterAccounts AS UTA WHERE UTA.IdAccountApiTwitter = ?", [profile._json.id_str]);

    // If already exists, continue to the website.
    if(rowsValidation.length > 0)
        return done(null, req.user);

    var myregexp = /([A-Za-z])/;
    var match = myregexp.exec(profile._json.name);
    const displayname = match[1];

    // If doesn't exists, add it to the database and continue.
    const newAccount = {
        IdUser: req.user.Id,
        Token: token,
        TokenSecret: tokenSecret,
        IdAccountApiTwitter: profile._json.id_str,
        Username: profile._json.screen_name,
        Displayname: displayname
    };
    await pool.query("INSERT INTO UsersTwitterAccounts SET ?", [newAccount]);

    return done(null, req.user);
}));

passport.serializeUser((user,done) => {
    done(null, user.Id);
}); //Guarda el id en sesion

passport.deserializeUser(async (id, done) => {
    const rows = await pool.query('SELECT * FROM Users WHERE Id = ? ', [id]);
    done(null, rows[0]);
}); //Obtiene desde el id serializado en sesion, los datos de la base
