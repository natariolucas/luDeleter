const express = require('express');
const morgan = require('morgan');
const exphbs = require('express-handlebars');
const path = require('path');
const flash = require('connect-flash');
const session = require('express-session');
const mysqlStore = require('express-mysql-session');
const { database } = require('./keys');
const passport = require('passport');

// Adding timestamp to every console.log
var log = console.log;
var date = "[" + new Date().toISOString() + "]";
console.log = function(){
    log.apply(console, [date].concat(arguments[0]));
};

// Starting twitter stream
const stream = require('./stream.js');

// initializations
const app = express();
require('./lib/passport');
stream.init();

// settings
app.set('port', process.env.PORT || 4000);
app.set('views', path.join(__dirname, 'views')); //Digo donde esta la carpeta views
app.engine('.hbs', exphbs({
    defaultLayout: 'main',
    layoutsDir: path.join(app.get('views'), 'layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
    extname: '.hbs',
    helpers: require('./lib/handlebars')
}));
app.set('view engine', '.hbs');

// Middlewares
app.use(session( {
    secret: 'lucasSessionKey',
    resave: false,
    saveUninitialized: false,
    store: new mysqlStore(database)
}));
app.use(flash());
app.use(morgan('dev'));
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());

// Global variables
app.use((req, res, next) => {
    app.locals.success = req.flash('exito');
    app.locals.failure = req.flash('fallo');
    app.locals.user = req.user;
   next();
});

// Routes
app.use(require('./routes/index.js'));
app.use(require('./routes/authentication.js'));
// app.use('/links', require('./routes/links.js'));

// Public
app.use(express.static(path.join(__dirname, 'public')));

// Starting the server
app.listen(app.get('port'), () => {
    console.log('## Server on port', app.get('port'));
});





