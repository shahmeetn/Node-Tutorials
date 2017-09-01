// load up the user model
var Room = require('../models/room');

module.exports = function (app, passport) {
    // PROFILE SECTION =========================
    app.get('/map', isLoggedIn, function (req, res) {
        Room.find({}, function(err, rooms){
             res.render('map.ejs', {
                rooms: rooms,
            });   
        });
    });
};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/');
}