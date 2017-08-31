var cv = require('opencv');
const AWS = require('aws-sdk');
var fs = require('fs');

AWS.config.update({
    "accessKeyId": '',
    "secretAccessKey": '',
    "region": 'us-east-1'
});

var rekognition = new AWS.Rekognition();

// camera properties
var camWidth = 320;
var camHeight = 240;
var camFps = 10;
var camInterval = 1000 / camFps;

// face detection properties
var rectColor = [0, 255, 0];
var rectThickness = 2;

// initialize camera
var camera = new cv.VideoCapture(0);
camera.setWidth(camWidth);
camera.setHeight(camHeight);

module.exports = function (socket) {
    setInterval(function () {
        camera.read(function (err, im) {
            if (err) throw err;
            
            im.detectObject(cv.FACE_CASCADE, {}, function (err, faces) {
                if (err) throw err;
                var params = {
                    CollectionId: 'surveillance',
                    Image: { 
                        Bytes: im.toBuffer()
                    },
                    FaceMatchThreshold: 95
                };
                rekognition.searchFacesByImage(params, function (err, data) {
                    if (err) console.log(err, err.stack); 
                    else console.log(JSON.stringify(data), '\n\n'); 
                    socket.emit('frame', {
                        buffer: im.toBuffer()
                    });
                });
            });
        });
    }, camInterval);
};