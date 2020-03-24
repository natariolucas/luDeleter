const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const pool = require('../database');
const helpers = require('../lib/helpers');

passport.use('local.signin', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, username, password, done) => {
    const rows = await pool.query('SELECT * FROM Users WHERE Username = ?', [username]);

    if(rows.length > 0) {
        const user = rows[0];
        const validPassword = await helpers.matchPassword(password, user.Password);
        console.log('VALID');
        console.log(validPassword);
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
    const newUser = {
        Username: username,
        Password : await helpers.encryptPassword(password),
        Fullname: req.body.fullname
    };

    const result = await pool.query("INSERT INTO Users SET ?", newUser);

    newUser.Id = result.insertId;
    return done(null, newUser); //Ejecuta luego el success o failure del objeto passport
}));

passport.serializeUser((user,done) => {
    done(null, user.Id);
}); //Guarda el id en sesion

passport.deserializeUser(async (id, done) => {
    const rows = await pool.query('SELECT * FROM Users WHERE Id = ? ', [id]);
    done(null, rows[0]);
}); //Obtiene desde el id serializado en sesion, los datos de la base
