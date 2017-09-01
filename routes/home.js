module.exports = function (app, passport) {

    app.get('/', function (req, res) {
        res.render('index');
    });

    // Logout
    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });

    app.get('/login', function (req, res) {
        res.render('login', {
            message: req.flash('loginMessage')
        });
    });

    // login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/image', 
        failureRedirect: '/login', 
        failureFlash: true 
    }));

    // signup form
    app.get('/signup', function (req, res) {
        res.render('signup', {
            message: req.flash('signupMessage')
        });
   });
    // signup form processing
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/profile', 
        failureRedirect: '/signup', 
        failureFlash: true 
   }));

    

    // local
    app.get('/connect/local', function (req, res) {
        res.render('connect-local.ejs', {
            message: req.flash('loginMessage')
        });
    });

    app.post('/connect/local', passport.authenticate('local-signup', {
        successRedirect: '/image', 
        failureRedirect: '/connect/local', 
        failureFlash: true
    }));
};

// user is logged in check
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/');
}