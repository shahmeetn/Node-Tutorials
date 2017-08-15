const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const config = require('./config/database');

const port = process.env.PORT || 3000;

mongoose.connect(config.database);

let db = mongoose.connection;

// Check connection
db.once('open', function () {
    console.log('Connected to MongoDB');
});

// Check for DB errors
db.on('error', function (err) {
    console.log(err);
});

// Set Public Folder
app.use(express.static(path.join(__dirname, '/public')));

// Passport Config
require('./config/passport')(passport);

// set up our express application
app.use(morgan('dev')); // log every request to the console

// Load View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Body Parser Middleware
app.use(cookieParser()); // read cookies (needed for auth)

// parse application/json
app.use(bodyParser.json());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
    extended: true
}));

// Express Session Middleware
app.use(session({
    secret: 'mSNZjn,8e6#~*M\M',
    resave: true,
    saveUninitialized: true
}));

// Express Messages Middleware
app.use(flash());

app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

// Express Validator Middleware
app.use(expressValidator({
    errorFormatter: function (param, msg, value) {
        var namespace = param.split('.'),
            root = namespace.shift(),
            formParam = root;

        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    }
}));

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', function (req, res, next) {
    res.locals.user = req.user || null;
    next();
});

// Route Files
require('./routes/home')(app, passport);
require('./routes/profile')(app, passport);

// Start Server
app.listen(port, function () {
    console.log('Server started on port 3000...');
});