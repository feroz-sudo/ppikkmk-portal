const admin = require("firebase-admin");

admin.initializeApp({
    projectId: "ppikkmk-d6388"
});
const db = admin.firestore();

async function run() {
    console.log("Locating Trainee user...");
    const userSnapshot = await db.collection("users").where("matricNumber", "==", "M20241001148").get();
    if (userSnapshot.empty) {
        throw new Error("Trainee M20241001148 not found!");
    }
    const traineeDoc = userSnapshot.docs[0];
    const traineeUid = traineeDoc.id;
    console.log(`Found trainee: ${traineeDoc.data().name} (UID: ${traineeUid})`);

    // Individual Clients (KI): 001 to 010
    console.log("Checking and registering Individual Clients (KI)...");
    for (let i = 1; i <= 10; i++) {
        const clientIdStr = String(i).padStart(3, '0'); // "001", "002"...
        const clientFileName = `PKIM20241001148/${clientIdStr}`;

        const q = await db.collection("clients")
            .where("traineeId", "==", traineeUid)
            .where("type", "==", "KI")
            .where("clientId", "==", clientIdStr)
            .get();

        if (q.empty) {
            await db.collection("clients").add({
                clientId: clientIdStr,
                type: "KI",
                traineeId: traineeUid,
                demographics: {
                    name: clientFileName,
                    age: 20,
                    gender: "N/A",
                    contactNumber: "N/A",
                    address: "N/A"
                },
                status: "active",
                createdAt: new Date()
            });
            console.log(`Registered KI client file: ${clientFileName}`);
        } else {
            console.log(`KI client file already exists: ${clientFileName}`);
        }
    }

    // Group Clients (KK): 001 to 004
    console.log("Checking and registering Group Clients (KK)...");
    for (let i = 1; i <= 4; i++) {
        const clientIdStr = String(i).padStart(3, '0'); // "001", "002"...
        const clientFileName = `PKKM20241001148/${clientIdStr}`;

        const q = await db.collection("clients")
            .where("traineeId", "==", traineeUid)
            .where("type", "==", "KK")
            .where("clientId", "==", clientIdStr)
            .get();

        if (q.empty) {
            await db.collection("clients").add({
                clientId: clientIdStr,
                type: "KK",
                traineeId: traineeUid,
                demographics: {
                    name: clientFileName,
                    age: 20,
                    gender: "N/A",
                    contactNumber: "N/A",
                    address: "N/A"
                },
                status: "active",
                createdAt: new Date()
            });
            console.log(`Registered KK client file: ${clientFileName}`);
        } else {
            console.log(`KK client file already exists: ${clientFileName}`);
        }
    }

    console.log("Clients registration completed successfully!");
}

run().catch(console.error);
