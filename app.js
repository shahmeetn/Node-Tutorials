// node modules import
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
const http = require('http');

//app port
const port = process.env.PORT || 3000;

//aws credentials
global.accessKey = '';
global.secretKey = '';

//mongodb connection with mangoose
mongoose.connect(config.database);

//create mongoose connection
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

//flash error and success mssages
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
require('./routes/image')(app, passport);
require('./routes/video')(app, passport);
require('./routes/map')(app, passport);

// Start Server
var server = http.createServer(app);
server.listen(port, function () {
    console.log('HTTP server listening on port ' + port);
});

//Socket init
const io = require('socket.io')(server);
io.on('connection', require('./routes/socket'));