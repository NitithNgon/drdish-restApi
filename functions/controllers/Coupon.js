const functions = require('firebase-functions');
const express = require("express");
const cors = require("cors");

const admin = require("firebase-admin");
// admin.initializeApp();
const db = admin.firestore();

const couponApp = express();

couponApp.use(cors({ origin: true }));


couponApp.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection("coupon").get();

    let coupon = {};
    snapshot.forEach((doc) => {
      let id = doc.id;
      let data = doc.data();

      coupon[id] = { ...data };
    });

    res.status(200).send(JSON.stringify(coupon));

  } catch (error) {
    res.status(500).json(error.message);
  }
});

couponApp.get("/:id", async (req, res) => {

  try {
    const snapshot = await db.collection('coupon').doc(req.params.id).get();
    const couponId = snapshot.id;
    const couponData = snapshot.data();
    let coupon = {};
    coupon[couponId] = { ...couponData };
    res.status(200).send(JSON.stringify(coupon));

  } catch (error) {
    res.status(500).json(error.message);
  }
});

couponApp.post("/", async (req, res) => {
  const coupon = req.body;
  const keyids = Object.keys(coupon);
  try {
    keyids.forEach(async (key) => {
      // let couponCustoms = coupon[key]
      // couponCustoms["coupon"]["expirationDate"] = admin.firestore.Timestamp.fromDate(new Date(couponCustoms["coupon"]["expirationDate"]));
      // await db.collection("coupon").doc(key).set(couponCustoms);
      await db.collection("coupon").doc(key).set(coupon[key]);
    });

    res.status(201).send({
      status: 'success',
      message: 'entry added successfully',
      datakeys: keyids,
      // datafromkey: coupon[keyids[0]],
      data: coupon
    });
  } catch (error) {
    res.status(500).json(error.message);
  }
});

couponApp.put("/", async (req, res) => {

  const coupon = req.body;
  const keyids = Object.keys(coupon);
  try {
    keyids.forEach(async (key) => {
      // let couponCustoms = coupon[key]
      // couponCustoms["coupon"]["expirationDate"] = admin.firestore.Timestamp.fromDate(new Date(couponCustoms["coupon"]["expirationDate"]));
      // await db.collection("coupon").doc(key).update(couponCustoms);
      await db.collection("coupon").doc(key).set(coupon[key]);
    });

    res.status(200).send({
      status: 'success',
      message: 'entry updated successfully',
      datakeys: keyids,
      // datafromkey: coupon[keyids[0]],
      data: coupon
    });
  } catch (error) {
    res.status(500).json(error.message);
  }
});

couponApp.delete("/:id", async (req, res) => {
  try {
    await db.collection("coupon").doc(req.params.id).delete();

    res.status(200).send({
      status: 'success',
      message: 'entry deleted successfully',
      datakey: req.params.id,
    });
  } catch (error) {
    res.status(500).json(error.message);
  }
});


couponApp.patch("/:userId/:couponId", async (req, res) => {

  try {
    const userId = req.params.userId;
    const couponId = req.params.couponId;
    //get coupon from ID
    const snapshot = await db.collection('coupon').doc(couponId).get();
    const couponData = snapshot.data();
    
    let coupon = {};
    coupon[couponId] = { ...couponData };
    
    //update coupon to user
    let couponUser =coupon[couponId];
    delete couponUser.keycode;
    delete couponUser.type;
    await db.collection('coupon').doc(couponId).update({
      [`limit`]: parseInt(couponUser.limit)-1
    });
    delete couponUser.limit;

    await db.collection('users').doc(userId).update({
      [`coupon.${couponId}`]: couponUser
    });
  
    res.status(200).send(JSON.stringify(coupon));

  } catch (error) {
    res.status(500).json(error.message);
  }
});


exports.coupon = functions.https.onRequest(couponApp);
