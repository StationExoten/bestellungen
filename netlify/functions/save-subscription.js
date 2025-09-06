const admin = require('firebase-admin');

// Inizializza Firebase Admin SDK usando le variabili d'ambiente
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

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const subscription = JSON.parse(event.body);
    // Usiamo l'endpoint come chiave per evitare duplicati
    const endpointB64 = Buffer.from(subscription.endpoint).toString('base64');
    
    await admin.database().ref('subscriptions/' + endpointB64).set(subscription);
    
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Subscription saved successfully.' }),
    };
  } catch (error) {
    console.error('Error saving subscription:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to save subscription.' }),
    };
  }
};