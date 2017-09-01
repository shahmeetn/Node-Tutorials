<<<<<<< HEAD
$('.upload-btn').on('click', function () {
    $('#upload-input').click();
});

$('#upload-input').on('change', function () {
    var files = $(this).get(0).files;

    if (files.length > 0) {
        var formData = new FormData();
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            formData.append('uploads[]', file, file.name);
        }
        $.ajax({
            url: '/image/upload',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function (data) {
                window.location = 'localhost:3000/video';
            }
        });
    }
});
=======
//import node modules
var path = require('path');
var fs = require('fs');
const AWS = require('aws-sdk');
var multer = require('multer');

//aws credentials initialization
AWS.config.update({
    "accessKeyId": global.accessKey,
    "secretAccessKey": global.secretKey,
    "region": 'us-east-1'
});

//load rekognition
var rekognition = new AWS.Rekognition();

//multipart upload
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
                Image: {
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

// login verification
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/');
}
>>>>>>> 5a0a6317554971f99c47fe28af52aa8c1086e9d1
