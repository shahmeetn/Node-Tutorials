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
    // PROFILE SECTION =========================
    app.get('/image', isLoggedIn, function (req, res) {
        var params = {
            CollectionId: 'surveillance'
            //MaxResults: 20
        };

        rekognition.listFaces(params, function (err, data) {
            if (err) console.log(err, err.stack); // an error occurred
            else console.log(data);           // successful response
            /*
            data = {
             CollectionIds: [
                "myphotos"
             ]
            }
            */
        });
        res.render('image.ejs', {
            user: req.user,
            images: data
        });
    });

    app.post('/image/delete', isLoggedIn, function (req, res) {
        var params = {
            CollectionId: 'surveillance',
            FaceIds: [
                "ff43d742-0c13-5d16-a3e8-03d3f58e980b"
            ]
        };
        rekognition.deleteFaces(params, function (err, data) {
            if (err) console.log(err, err.stack); // an error occurred
            else console.log(data);           // successful response
            /*
            data = {
             DeletedFaces: [
                "ff43d742-0c13-5d16-a3e8-03d3f58e980b"
             ]
            }
            */
        });
        res.render('image.ejs', {
            // user: req.user,
            // images: data
        });
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
                        res.redirect('/video');
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