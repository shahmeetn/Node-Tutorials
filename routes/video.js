module.exports = function (app, passport) {
    // PROFILE SECTION =========================
    app.get('/video', isLoggedIn, function (req, res) {
        res.render('video.ejs', {
            user: req.user
        });
    });
};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/');
}