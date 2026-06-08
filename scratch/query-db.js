const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize with application default credentials (ADC) since firebase-tools is logged in
initializeApp({
  projectId: 'ppikkmk-d6388'
});

const db = getFirestore();

async function run() {
  console.log("=== CLIENTS ===");
  const clientsSnap = await db.collection('clients').get();
  clientsSnap.forEach(doc => {
    console.log(`Client Doc ID: ${doc.id}`);
    console.log(JSON.stringify(doc.data(), null, 2));
  });

  console.log("\n=== SESSIONS ===");
  const sessionsSnap = await db.collection('sessions').get();
  sessionsSnap.forEach(doc => {
    console.log(`Session Doc ID: ${doc.id}`);
    console.log(JSON.stringify(doc.data(), null, 2));
  });
}

run().catch(console.error);
