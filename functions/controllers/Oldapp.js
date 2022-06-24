const functions = require('firebase-functions');

// The Firebase Admin SDK to access Firestore.
const admin = require('firebase-admin');
// admin.initializeApp();
const db = admin.firestore();

exports.isPhoneExisted = functions.https.onRequest(async (req, res) => {
    const phoneNumber = "+"+req.query.phone;
    console.log(phoneNumber);
    return admin.auth().getUserByPhoneNumber(phoneNumber)
        .then(function() {
            res.send(true);
        })
        .catch(function(error) {
            if (error.code === 'auth/user-not-found') {
                res.send(false);
            // User not found.
            }
            else{
                console.log(error);
                res.send('error');
            }
        });
  });
  

exports.updateChatRoom = functions.firestore.document('/rooms/{roomId}/messages/{messageId}')
.onCreate(async (snap, context) => {
   //console.log(snap.data());
    var data = snap.data();
    var authorId = data.authorId;
    //if(authorId!="EZ6Qzfms6vU5WZ7e85ItcnQ5MG52"){
        //console.log(context.params.roomId);
        var room = await db.collection('rooms').doc(context.params.roomId).get();
        var roomData = room.data();
        //console.log(room.data());
        //console.log(authorId);
        //console.log(roomData.userIds);
        var receiverIdIndex = (roomData.userIds.indexOf(authorId)+1)%2;
        //console.log(receiverIdIndex);
        //console.log(roomData.userIds[0]);
        //console.log(roomData.userIds.indexOf(authorId));
        var receiverId = roomData.userIds[receiverIdIndex];
        //console.log(receiverId);
        var receiver = await db.collection('users').doc(receiverId).get();
        var tokens = receiver.data().tokens;
        //console.log(tokens);
        //console.log(data.type);
        //console.log(data.text);
        var textToSend = (data.type == "text")? data.text:"ข้อความรูปภาพหรือไฟล์";
        try{
        db.collection('rooms').doc(context.params.roomId).set({
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            }, {merge:true});
        admin.messaging().sendToDevice(tokens,{
           notification: {
            title: "ข้อความใหม่",
            body: textToSend,
            sound: "default"
          },
        });
        }
        catch(e){
            console.log('error occur');
            console.log(e);
        }
        finally{
            return;
        }
    }
);

exports.notifyOrder = functions.firestore.document('/orders/{orderDocId}')
.onCreate(async (snap, context) => {
    var adminId = "EZ6Qzfms6vU5WZ7e85ItcnQ5MG52";
    var receiver = await db.collection('users').doc(adminId).get();
    var tokens = receiver.data().tokens;
    try{
        admin.messaging().sendToDevice(tokens,{
           notification: {
            title: "มีออเดอร์ใหม่ [Admin]",
            body: "มีออเดอร์ใหม่",
            sound: "default"
          },
        });
        }
        catch(e){
            console.log('error occur');
            console.log(e);
        }
        finally{
            return;
        }
    }
);

exports.newAppDownload = functions.firestore.document('/users/{userId}')
.onCreate(async (snap, context) => {
    var adminId = "EZ6Qzfms6vU5WZ7e85ItcnQ5MG52";
    var receiver = await db.collection('users').doc(adminId).get();
    var tokens = receiver.data().tokens;
    try{
        admin.messaging().sendToDevice(tokens,{
           notification: {
            title: "ลูกค้าใหม่ดาวน์โหลดแอพ [Admin]",
            body: context.params.userId,
            sound: "default"
          },
        });
        }
        catch(e){
            console.log('error occur');
            console.log(e);
        }
        finally{
            return;
        }
    }
);

