const admin = require('firebase-admin');
const webpush = require('web-push');

// Inizializza Firebase Admin SDK
try {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
      databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}-default-rtdb.europe-west1.firebasedatabase.app`
    });
  }
} catch (error) {
  console.error('Firebase admin initialization error', error.stack);
}

// Configura web-push con le chiavi VAPID
webpush.setVapidDetails(
  'mailto:your-email@example.com', // Sostituisci con la tua email
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const notificationPayload = JSON.parse(event.body);
    const snapshot = await admin.database().ref('subscriptions').once('value');
    const subscriptions = snapshot.val();
    
    if (!subscriptions) {
      return { statusCode: 200, body: JSON.stringify({ message: 'No subscriptions to notify.' }) };
    }
    
    const notificationPromises = Object.values(subscriptions).map(sub => 
      webpush.sendNotification(sub, JSON.stringify(notificationPayload))
    );
    
    await Promise.all(notificationPromises);
    
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Notifications sent successfully.' }),
    };
  } catch (error) {
    console.error('Error sending notifications:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to send notifications.' }),
    };
  }
};