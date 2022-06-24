const admin = require('firebase-admin');
admin.initializeApp();

module.exports ={
    ...require('./controllers/Oldapp'),
    ...require('./controllers/Restaurants'),
    ...require('./controllers/JsonDB'),
    ...require('./controllers/Coupon'),
    ...require('./controllers/MoneySpace'),
    ...require('./controllers/notificationUser'),
}

