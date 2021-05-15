const firebaseKey = require('../keys/firebaseKey.json') 

function initializeFirebase(){
    const firebaseAdmin = require("firebase-admin");
    firebaseAdmin.initializeApp({
        credential: firebaseAdmin.credential.cert(firebaseKey)
    });
    return firebaseAdmin;
}

async function sendNotificationByTokens({title, body, tokens}){
    const message = {
        notification: {
            title: title,
            body: body
        },
        tokens: tokens,
    }
    const firebaseAdmin = initializeFirebase();
    try{
        const {successCount, failureCount} = await firebaseAdmin.messaging().sendMulticast(message);
        const totalMsjs = failureCount+successCount
        console.log(`${successCount}/${totalMsjs} messages were sent successfully`)
    }catch(error){
        console.log('Error sendind messages', error);
    }
}

module.exports= {
    sendNotificationByTokens
}