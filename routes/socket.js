var cv = require('opencv');
const AWS = require('aws-sdk');
var fs = require('fs');

AWS.config.update({
    "accessKeyId": global.accessKey,
    "secretAccessKey": global.secretKey,
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

// load up the user model
var Room = require('../models/room');

module.exports = function (socket) {
    setInterval(function () {
        camera.read(function (err, im) {
            if (err) throw err;

            im.detectObject(cv.FACE_CASCADE, {}, function (err, faces) {
                if (err) throw err;

                console.log(JSON.stringify(faces), '\n\n');

                if (faces.length > 0) {
                    var params = {
                        CollectionId: 'surveillance',
                        Image: {
                            Bytes: im.toBuffer()
                        },
                        FaceMatchThreshold: 95
                    };
                    rekognition.searchFacesByImage(params, function (err, data) {
                        console.log(JSON.stringify(data), '\n\n');
                        if (err){
                             //Can throw
                        }else {
                            if(data['FaceMatches'] && data['FaceMatches'].length > 0 && typeof data['FaceMatches'][0].Face != "undefined" && data['FaceMatches'][0].Face){
                                var face_obj = data['FaceMatches'][0].Face;
                                if(typeof face_obj.ExternalImageId !="undefined" &&
                                face_obj.ExternalImageId){
                                    var person = face_obj.ExternalImageId;
                                    Room.findOne({'local.person': person}, function(err, Person_res){
                                        //console.log("WORKINGGGGGGGGGGGGGGGGGGGGGGG>>>>>>"+JSON.stringify(Person_res));
                                        if(err){
                                            throw err;
                                        }else{
                                            if(Person_res==null){
                                                console.log("PERFECTWORKINGGGGGGGGGGGGGGGGGGGGGGG>>>>>>"+JSON.stringify(Person_res));
                                                var room = new Room();
                                                room.local.room = 1;
                                                room.local.person = person;
                                                room.save(function(err) {
                                                    if (err)
                                                        throw err;
                                                });
                                            }
                                        }
                                    });
                                }
                            }
                            socket.emit('frame', {
                                buffer: im.toBuffer()
                            });
                        }
                        
                    });
                } else {
                    socket.emit('frame', {
                        buffer: im.toBuffer()
                    });
                }
            });
        });
    }, camInterval);
};