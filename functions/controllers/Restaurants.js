const functions = require('firebase-functions');
const express = require("express");
const cors = require("cors");

const admin = require("firebase-admin");
// admin.initializeApp();
const db = admin.firestore();

const restApp = express();

restApp.use(cors({ origin: true }));


restApp.get("/", async (req, res) => {
  try{
    const snapshot = await db.collection("Restaurants").get();

    let restaurants = {};
    snapshot.forEach((doc) => {
        let id = doc.id;
        let data = doc.data();

        restaurants[id]={ ...data };
     });

    res.status(200).send(JSON.stringify(restaurants));
    
  } catch(error){
    res.status(500).json(error.message);
  }
});

restApp.get("/:id", async (req, res) => {

    try{
        const snapshot = await db.collection('Restaurants').doc(req.params.id).get();
        const restaurantId = snapshot.id;
        const restaurantData = snapshot.data();
        let restaurant = {};
        restaurant[restaurantId]={ ...restaurantData };  
        res.status(200).send(JSON.stringify(restaurant));

    } catch(error){
        res.status(500).json(error.message);
    }
});

restApp.post("/", async (req, res) => {
  const restaurants = req.body;
  const keyids = Object.keys(restaurants);
  try {
    keyids.forEach(async (key) => {
        await db.collection("Restaurants").doc(key).set(restaurants[key]);
    });

    res.status(201).send({
        status: 'success',
        message: 'entry added successfully',
        datakeys: keyids,
        // datafromkey: restaurants[keyids[0]],
        data: restaurants
     });
  } catch(error){
        res.status(500).json(error.message);
  }
});

restApp.put("/", async (req, res) => {

  const restaurants = req.body;
  const keyids = Object.keys(restaurants);
  try {
    keyids.forEach(async (key) => {
        await db.collection("Restaurants").doc(key).update(restaurants[key]);
    });

    res.status(200).send({
        status: 'success',
        message: 'entry updated successfully',
        datakeys: keyids,
        // datafromkey: restaurants[keyids[0]],
        data: restaurants
     });
  } catch(error){
        res.status(500).json(error.message);
  }
});

restApp.delete("/:id", async (req, res) => {
    try {
        await db.collection("Restaurants").doc(req.params.id).delete();

        res.status(200).send({
            status: 'success',
            message: 'entry deleted successfully',
            datakey: req.params.id,
        });
    } catch(error){
        res.status(500).json(error.message);
    }
});

exports.restaurants = functions.https.onRequest(restApp);
