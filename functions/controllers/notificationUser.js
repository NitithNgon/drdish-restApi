const functions = require('firebase-functions');
const admin = require('firebase-admin');
// admin.initializeApp();
const database = admin.firestore();



// exports.timerUpdate = functions.pubsub.schedule('* * * * *').onRun((context) => {
//     database.doc("timers/timer1").update({ "time": admin.firestore.Timestamp.now() });
//     return console.log('successful timer update');
// });

// ___________________________________________________________________________________________________________

exports.sendNotification = functions.firestore.document('/ordersNew/{orderDocId}').onWrite(async (change, context) => {

    //check notificationSent waitingPayment status
    checkNotificationSent("waitingPayment",
        "waitingPayment: orderNo.",
        "Payment will be expire in 24hr."
    );

    //check notificationSent processing status
    checkNotificationSent("processing",
        "processing: orderNo.",
        "Thankyou for your Payment."
    );

    //check notificationSent cooking status
    checkNotificationSent("cooking",
        "cooking: orderNo.",
        "Your order is being cooked by the chef."
    );

    //check notificationSent delivering status
    checkNotificationSent("delivering",
        "delivering: orderNo.",
        "Your order is being delivered by the rider."
    );

    //check notificationSent success status
    checkNotificationSent("success",
        "success: orderNo.",
        "Enjoy your meal! Be healthy and happy!"
    );

    //check notificationSent canceledBySystem status
    checkNotificationSent("canceledBySystem",
        "canceled: orderNo.",
        "Your order is unpaid."
    );


    async function checkNotificationSent(status, title, body) {
        const queryStatus6 = await database.collection("ordersNew")
            .where("status", '==', status)
            .where("notificationSent", '!=', status).get();
        queryStatus6.forEach(async snapshot => {
            sendNotification(snapshot.data().uid, title + snapshot.data().id, body);
            console.log(snapshot.data().uid)
            await database.doc('ordersNew/' + snapshot.id).update({
                "notificationSent": status,
            });
        });
    }

    async function sendNotification(uid, title, body) {
        let snapshotUser = await database.collection('users').doc(uid).get();
        const tokens = ((snapshotUser).data()).tokens
        // console.log(tokens);

        const message = {
            notification: {
                title: title,
                body: body,
                sound: "default",
                icon: "myicon",
            },
        };

        admin.messaging().sendToDevice(tokens, message)
            .then(response => {
                console.log("Successful Message Sent:");
            })
            .catch(error => {
                console.log("Error Sending Message:", error);
            });
    }
    console.log('End Of Function');
});