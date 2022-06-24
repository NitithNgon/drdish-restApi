const functions = require('firebase-functions');


exports.moneySpace = functions.https.onRequest(async (req, res) => {
    try{
        res.send(true);
        
      } catch(error){
        console.log(error);
        res.send('error');
      }
  });