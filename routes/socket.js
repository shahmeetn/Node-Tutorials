var cv = require('opencv');
const AWS = require('aws-sdk');

var fs = require('fs');
var bitmap = fs.readFileSync('/home/meets/Pictures/Actor.jpg');

AWS.config.update({
    "accessKeyId": 'AKIAIHOOZKFB3WG3KP4Q',
    "secretAccessKey": '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',
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
  setInterval(function() {
    camera.read(function(err, im) {
      if (err) throw err;

      im.detectObject(cv.FACE_CASCADE, {}, function(err, faces) {
        if (err) throw err;

        for (var i = 0; i < faces.length; i++) {
          face = faces[i];
          im.rectangle([face.x, face.y], [face.width, face.height], rectColor, rectThickness);
        }


        socket.emit('frame', { buffer: im.toBuffer() });
      });
    });
  }, camInterval);
};

function insertintoCOllection() {
    var params = {
        CollectionId: 'surveillance', /* required */
        Image: { /* required */
            Bytes: bitmap
        },
        ExternalImageId: 'surveillance'
    };
    rekognition.indexFaces(params, function (err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else console.log(data);           // successful response
        var params = {
            CollectionId: "surveillance"
        };
        rekognition.listFaces(params, function (err, data) {
            if (err) console.log(err, err.stack); // an error occurred
            else console.log(data);           // successful response
            var params = {
                CollectionId: 'surveillance', /* required */
                Image: { /* required */
                    Bytes: bitmap
                },
                FaceMatchThreshold: 95
            };
            rekognition.searchFacesByImage(params, function (err, data) {
                if (err) console.log(err, err.stack); // an error occurred
                else console.log(data);           // successful response
            });
        });
    });
}