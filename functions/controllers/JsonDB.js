const functions = require("firebase-functions");
const firebase = require("firebase-admin");
const formidable = require("formidable-serverless");
const UUID = require("uuid-v4");

// const { Storage } = require("@google-cloud/storage");


exports.uploadFile = functions.https.onRequest((req, res) => {
  var form = new formidable.IncomingForm();
  return new Promise((resolve, reject) => {
    form.parse(req, async (err, fields, files) => {
      var file = files.file;
      if (!file) {
        reject(new Error("no file to upload, please choose a file."));
        return;
      }
      var filePath = file.path;
      var fileName = file.name;
      var fileType = file.type;
      console.log("File path: " + filePath);
      console.log("File name: " + fileName);
      console.log("File type: " + fileType);
      // gcs 
      // const storage = new Storage({
      //   keyFilename: "drdish-7de98-f940427dc51e.json",
      // });
      let uuid = UUID();
      const thumbFileName = `filejson/${fileName}`;

      //when use gcs initialize
      // const response = await storage.bucket("drdish-7de98.appspot.com").upload
      const response = await firebase.storage().bucket("drdish-7de98.appspot.com").upload(filePath, {
        destination: thumbFileName,
        contentType: file.type,
        metadata: {
          metadata: {
            firebaseStorageDownloadTokens: uuid,
          },
        },
      });

      resolve({ fileInfo: response[0].metadata}); // Whole thing completed successfully.
    });
  })
    .then((response) => {
      res.status(200).json({ response });
      return null;
    })
    .catch((err) => {
      console.error("Error while parsing form: " + err);
      res.status(500).json({ error: err });
    });
});


//use gcs ==> error

// const functions = require('firebase-functions');
// const admin = require('firebase-admin');
// //admin.initializeApp();
// const os = require('os');
// const path = require('path');
// // const spawn = require('child-process-promise').spawn;
// const cors = require("cors")({ origin: true });
// const Busboy = require("busboy");
// const fs = require('fs');

// const { Storage } = require('@google-cloud/storage');
// const gcs = new Storage({
//   projectId: 'drdish-7de98',
//   keyFilename: 'drdish-7de98-f940427dc51e.json'
// });

// exports.uploadFile = functions.https.onRequest((req, res) => {
//   cors(req, res, () => {
//     if (req.method !== "POST") {
//       return res.status(500).json({
//         message: "Not allowed"
//       });
//     }
    
//     const busboy = Busboy({ headers: req.headers });
//     var uploadData = null;

//     busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
//       const filepath = path.join(os.tmpdir(), filename);
//       uploadData = { file: filepath, type: mimetype };
//       file.pipe(fs.createWriteStream(filepath));
//     });

//     console.log("path: "+uploadData.file);
//     busboy.on("finish", () => {
//       const bucket = gcs.bucket("drdish-7de98.appspot.com");
//       bucket
//         .upload(uploadData.file, {
//           uploadType: "media",
//           metadata: {
//             metadata: {
//               contentType: uploadData.type
//             }
//           }
//         })
//         .then(() => {
//           res.status(200).json({
//             message: "It worked!"
//           });
//         })
//         .catch(err => {
//           res.status(500).json({
//             error: err
//           });
//         });
//     });
//     busboy.end(req.rawBody);
//   });
// });

//(resize img to 500x500 and save instead oldfile and rename to resized-oldname)


// exports.onFileChange= functions.storage.object().onChange(event => {
//     const object = event.data;
//     const bucket = object.bucket;
//     const contentType = object.contentType;
//     const filePath = object.name;
//     console.log('File change detected, function execution started');

//     if (object.resourceState === 'not_exists') {
//         console.log('We deleted a file, exit...');
//         return;
//     }

//     if (path.basename(filePath).startsWith('resized-')) {
//         console.log('We already renamed that file!');
//         return;
//     }

//     const destBucket = gcs.bucket(bucket);
//     const tmpFilePath = path.join(os.tmpdir(), path.basename(filePath));
//     const metadata = { contentType: contentType };
//     return destBucket.file(filePath).download({
//         destination: tmpFilePath
//     }).then(() => {
//         return spawn('convert', [tmpFilePath, '-resize', '500x500', tmpFilePath]);
//     }).then(() => {
//         return destBucket.upload(tmpFilePath, {
//             destination: 'resized-' + path.basename(filePath),
//             metadata: metadata
//         })
//     });
// });
