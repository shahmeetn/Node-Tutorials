const AWS = require('aws-sdk');

module.exports = function (app, passport) {
    // PROFILE SECTION =========================
    app.get('/profile', isLoggedIn, function (req, res) {

        AWS.config.update({
            accessKeyId: global.accessKey,
            secretAccessKey: global.secretKey,
            region: 'us-east-1'
        });

        const rekognition = new AWS.Rekognition();

        rekognition.listCollections(function (err, data) {
            if (err) console.log(err);

            console.log(JSON.stringify(data));
        });

        res.render('profile.ejs', {
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