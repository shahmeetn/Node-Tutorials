var path = require('path');
var fs = require('fs');
const AWS = require('aws-sdk');
var multer = require('multer');

AWS.config.update({
    "accessKeyId": '',
    "secretAccessKey": '',
    "region": 'us-east-1'
});

var rekognition = new AWS.Rekognition();

var storage = multer.memoryStorage();

var upload = multer({
    storage: storage
});

module.exports = function (app, passport) {
    app.get('/image', isLoggedIn, function (req, res) {
        var params = {
            CollectionId: 'surveillance'
        };
        rekognition.listFaces(params, function (err, data) {
            if (err) console.log(err, err.stack);
            else console.log(data);
            res.render('image.ejs', {
                user: req.user,
                images: data
             });
        });
    });

    app.get('/image/delete', isLoggedIn, function (req, res) {
        var faceId = req.query.faceId;
        var params = {
            CollectionId: 'surveillance',
            FaceIds: [
                faceId
            ]
        };
        rekognition.deleteFaces(params, function (err, data) {
            if (err) console.log(err, err.stack);
            else console.log(data);
        });
        res.redirect('/image');
    });

    app.post('/image/upload', isLoggedIn, upload.any(), function (req, res) {
        req.files.forEach(function (images) {
            var params = {
                CollectionId: 'surveillance',
                /* required */
                Image: { /* required */
                    Bytes: images.buffer
                },
                ExternalImageId: images.originalname
            };
            rekognition.indexFaces(params, function (err, data) {
                if (err) console.log(err, err.stack);
                if (req.files.indexOf(images) == req.files.length - 1) {
                    var params = {
                        CollectionId: "surveillance"
                    };
                    rekognition.listFaces(params, function (err, data) {
                        if (err) console.log(err, err.stack); // an error occurred

                        console.log(data); // successful response
                        res.redirect('/image');
                    });
                }
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