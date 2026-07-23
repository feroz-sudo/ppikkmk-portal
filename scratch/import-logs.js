const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

// Initialize Firebase Admin
admin.initializeApp({
    projectId: "ppikkmk-d6388"
});
const db = admin.firestore();

const CATEGORIES = {
    INDIV: "Individual Counselling",
    GROUP: "Group Counselling",
    CRISIS: "Crisis Intervention",
    PFA: "PFA/MHPSS",
    PSYCHO: "Psychoeducation/Community",
    TEST: "Testing & Assessment",
    ADMIN: "Management & Admin",
    DEV: "Professional Development",
    SUPERVISION: "Supervision"
};

// Map activity text to category
function determineCategory(activity, location) {
    const act = activity.toLowerCase();
    const loc = (location || "").toLowerCase();
    
    if (act.includes("individual counselling") || act.includes("kaunseling individu") || /\bPKIM\d+/i.test(act)) {
        return CATEGORIES.INDIV;
    }
    if (act.includes("group counselling") || act.includes("kaunseling kelompok") || /\bPKKM\d+/i.test(act)) {
        return CATEGORIES.GROUP;
    }
    if (act.includes("crisis") || act.includes("krisis") || act.includes("suicide") || act.includes("self-harm")) {
        return CATEGORIES.CRISIS;
    }
    if (act.includes("pfa") || act.includes("mhpss") || act.includes("psychological first aid") || act.includes("hotline")) {
        return CATEGORIES.PFA;
    }
    // PSYCHO: only genuine delivery — outreach booth/program, psychoeducation execution, webinar moderation
    if (
        act.includes("psychoeducation") ||
        act.includes("psikopendidikan") ||
        act.includes("uk outreach program") ||
        act.includes("execution of psychoeducational") ||
        (act.includes("outreach") && (act.includes("program") || act.includes("execution") || act.includes("exhibition"))) ||
        (act.includes("moderator") || act.includes("moderat"))
    ) {
        return CATEGORIES.PSYCHO;
    }
    if (act.includes("inventory") || act.includes("inventori") || act.includes("testing") || act.includes("assessment") || act.includes("ujian") || act.includes("saringan")) {
        return CATEGORIES.TEST;
    }
    if (act.includes("supervision") || act.includes("penyeliaan") || act.includes("meeting with supervisor") || act.includes("supervisor")) {
        return CATEGORIES.SUPERVISION;
    }
    // DEV: watching/attending webinars, talks, lectures, professional reading
    if (
        act.includes("professional development") ||
        (act.includes("webinar") && !act.includes("moderator") && !act.includes("preparation for")) ||
        act.includes("reading") ||
        act.includes("literatur") ||
        act.includes("attending lectures") ||
        act.includes("attended")
    ) {
        return CATEGORIES.DEV;
    }
    // Default to Admin & Management
    return CATEGORIES.ADMIN;
}

// Convert time "08:10 - 12:00" to hours
function calculateHours(timeStr) {
    if (!timeStr || timeStr.trim() === "-" || !timeStr.includes("-")) return 0;
    try {
        const parts = timeStr.split("-");
        const parseTime = (s) => {
            s = s.trim().toLowerCase();
            let hours = 0, minutes = 0;
            const match = s.match(/^(\d{1,2}):(\d{2})\s*(am|pm)?$/);
            if (match) {
                hours = parseInt(match[1]);
                minutes = parseInt(match[2]);
                const ampm = match[3];
                if (ampm === "pm" && hours < 12) hours += 12;
                if (ampm === "am" && hours === 12) hours = 0;
            } else {
                const simpleMatch = s.match(/^(\d{1,2})(?::(\d{2}))?$/);
                if (simpleMatch) {
                    hours = parseInt(simpleMatch[1]);
                    minutes = simpleMatch[2] ? parseInt(simpleMatch[2]) : 0;
                }
            }
            return hours * 60 + minutes;
        };
        const startMin = parseTime(parts[0]);
        const endMin = parseTime(parts[1]);
        if (endMin > startMin) {
            return parseFloat(((endMin - startMin) / 60).toFixed(1));
        }
    } catch (e) {
        console.error("Error calculating hours for:", timeStr, e.message);
    }
    return 0;
}

async function run() {
    console.log("Locating Trainee user...");
    const userSnapshot = await db.collection("users")
        .where("matricNumber", "==", "M20241001148")
        .where("role", "==", "trainee")
        .get();
    if (userSnapshot.empty) {
        throw new Error("Trainee M20241001148 not found!");
    }
    const traineeDoc = userSnapshot.docs[0];
    const traineeUid = traineeDoc.id;
    console.log(`Found trainee: ${traineeDoc.data().name} (UID: ${traineeUid})`);

    const mdPath = path.join(__dirname, "../LOG HARIAN.md");
    const content = fs.readFileSync(mdPath, "utf-8");
    const lines = content.split("\n");

    let currentWeek = 0;
    let currentDayId = ""; // mon, tue, wed...
    let currentDayLabel = ""; // e.g. "Monday"
    let currentDayDate = ""; // e.g. "2026-03-09"
    
    // Store logs grouped by week
    const weeklyData = {}; // weekNumber -> { logsByDay: { mon: [], ... }, totals }

    const dayNameMap = {
        monday: "mon", tuesday: "tue", wednesday: "wed", thursday: "thu", friday: "fri", saturday: "sat", sunday: "sun",
        isnin: "mon", selasa: "tue", rabu: "wed", khamis: "thu", jumaat: "fri", sabtu: "sat", ahad: "sun"
    };

    console.log("Parsing markdown...");
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Detect Day / Date Header
        // e.g. **BUKU LOG HARIAN** **MONDAY — 09/03/2026** **MINGGU KE: 1**
        const dayHeaderMatch = line.match(/\*\*BUKU LOG HARIAN\*\*\s*\*\*(MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY|SUNDAY)\s*[-—]+\s*(\d{2}\/\d{2}\/\d{4})\*\*/i);
        if (dayHeaderMatch) {
            const dayLabel = dayHeaderMatch[1];
            currentDayLabel = dayLabel;
            currentDayId = dayNameMap[dayLabel.toLowerCase()] || "mon";
            
            const rawDate = dayHeaderMatch[2]; // DD/MM/YYYY
            const parts = rawDate.split("/");
            currentDayDate = `${parts[2]}-${parts[1]}-${parts[0]}`; // YYYY-MM-DD
            continue;
        }

        // Detect Week Change
        const weekMatch = line.match(/\*\*MINGGU KE:\s*(\d+)\*\*/i);
        if (weekMatch) {
            currentWeek = parseInt(weekMatch[1]);
            if (!weeklyData[currentWeek]) {
                weeklyData[currentWeek] = {
                    logsByDay: { mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] },
                    f2fIndiv: 0, f2fKelompok: 0, profAct: 0, admin: 0, profDev: 0, supervision: 0
                };
            }
            continue;
        }

        // Parse Table Rows
        if (line.startsWith("|")) {
            // Ignore headers and separators
            if (line.toLowerCase().includes("lokasi") || line.includes("---")) continue;
            
            const cols = line.split("|").map(s => s.trim());
            if (cols.length >= 5) {
                const location = cols[1];
                const timeRange = cols[2];
                const activity = cols[3];
                const notes = cols[4];

                if (!location && !timeRange && !activity) continue;

                // Determine category and hours
                const category = determineCategory(activity, location);
                const hours = calculateHours(timeRange);

                const logEntry = {
                    location: location || "-",
                    time: timeRange || "-",
                    activity: activity || "-",
                    notes: notes || "-",
                    category,
                    hours
                };

                if (currentWeek && currentDayId) {
                    weeklyData[currentWeek].logsByDay[currentDayId].push(logEntry);
                }
            }
        }
    }

    console.log("Uploading individual logs and weekly summary forms to Firestore...");
    
    // Clear old logs for this trainee to prevent duplicates
    const oldLogs = await db.collection("logs").where("traineeId", "==", traineeUid).get();
    console.log(`Deleting ${oldLogs.size} old log entries...`);
    const batchDelete = db.batch();
    oldLogs.docs.forEach(doc => batchDelete.delete(doc.ref));
    await batchDelete.commit();

    for (const [weekNumStr, weekObj] of Object.entries(weeklyData)) {
        const weekNum = parseInt(weekNumStr);
        console.log(`Processing Week ${weekNum}...`);

        let weekF2FIndiv = 0;
        let weekF2FKelompok = 0;
        let weekProfAct = 0;
        let weekAdmin = 0;
        let weekProfDev = 0;
        let weekSupervision = 0;

        const cleanLogsByDay = { mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] };
        
        // Setup rumusan matrix
        const matrix = {};
        const categoriesList = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'];
        categoriesList.forEach(cId => {
            matrix[cId] = { mon: "", tue: "", wed: "", thu: "", fri: "", sat: "", sun: "" };
        });

        const dayKeys = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
        
        for (const dayId of dayKeys) {
            const logsList = weekObj.logsByDay[dayId] || [];
            
            // Calculate actual date for this day
            const startDateSem = new Date(2026, 2, 9);
            const startOffset = (weekNum - 1) * 7;
            const dayOffset = dayKeys.indexOf(dayId);
            const date = new Date(startDateSem);
            date.setDate(startDateSem.getDate() + startOffset + dayOffset);
            
            const formatLocal = (d) => {
                const y = d.getFullYear();
                const m = (d.getMonth() + 1).toString().padStart(2, '0');
                const day = d.getDate().toString().padStart(2, '0');
                return `${y}-${m}-${day}`;
            };
            const dateStr = formatLocal(date);

            for (const log of logsList) {
                // Save individual log entry to logs collection
                const logRef = await db.collection("logs").add({
                    traineeId: traineeUid,
                    date: dateStr,
                    location: log.location,
                    startTime: log.time.split("-")[0]?.trim() || "-",
                    endTime: log.time.split("-")[1]?.trim() || "-",
                    hours: log.hours,
                    category: log.category,
                    description: log.activity,
                    notes: log.notes,
                    status: "pending",
                    createdAt: new Date()
                });

                // Map to dailyLog format for weekly logHarian document
                const dailyLogObj = {
                    id: logRef.id,
                    location: log.location,
                    time: log.time,
                    activity: log.activity,
                    notes: log.notes,
                    hours: log.hours,
                    category: log.category
                };
                cleanLogsByDay[dayId].push(dailyLogObj);

                // Accumulate weekly summary totals
                if (log.category === CATEGORIES.INDIV) {
                    weekF2FIndiv += log.hours;
                    const val = parseFloat(matrix['a'][dayId]) || 0;
                    matrix['a'][dayId] = (val + log.hours).toFixed(1);
                } else if (log.category === CATEGORIES.GROUP) {
                    weekF2FKelompok += log.hours;
                    const val = parseFloat(matrix['b'][dayId]) || 0;
                    matrix['b'][dayId] = (val + log.hours).toFixed(1);
                } else if (log.category === CATEGORIES.ADMIN) {
                    weekAdmin += log.hours;
                    const val = parseFloat(matrix['g'][dayId]) || 0;
                    matrix['g'][dayId] = (val + log.hours).toFixed(1);
                } else if (log.category === CATEGORIES.DEV) {
                    weekProfDev += log.hours;
                    const val = parseFloat(matrix['h'][dayId]) || 0;
                    matrix['h'][dayId] = (val + log.hours).toFixed(1);
                } else if (log.category === CATEGORIES.SUPERVISION) {
                    weekSupervision += log.hours;
                    const val = parseFloat(matrix['i'][dayId]) || 0;
                    matrix['i'][dayId] = (val + log.hours).toFixed(1);
                } else {
                    weekProfAct += log.hours;
                    let catKey = 'c';
                    if (log.category === CATEGORIES.CRISIS) catKey = 'c';
                    else if (log.category === CATEGORIES.PFA) catKey = 'd';
                    else if (log.category === CATEGORIES.PSYCHO) catKey = 'e';
                    else if (log.category === CATEGORIES.TEST) catKey = 'f';
                    
                    const val = parseFloat(matrix[catKey][dayId]) || 0;
                    matrix[catKey][dayId] = (val + log.hours).toFixed(1);
                }
            }
        }

        // Clean matrix empty strings
        categoriesList.forEach(cId => {
            dayKeys.forEach(dayId => {
                if (matrix[cId][dayId] === "" || parseFloat(matrix[cId][dayId]) === 0) {
                    matrix[cId][dayId] = "";
                }
            });
        });

        // 1. Save Log Harian Weekly Form
        // We flatten logs for backwards compatibility
        const flatLogs = [];
        const dayNames = { mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun" };
        dayKeys.forEach(dayId => {
            const startDateSem = new Date(2026, 2, 9);
            const startOffset = (weekNum - 1) * 7;
            const dayOffset = dayKeys.indexOf(dayId);
            const date = new Date(startDateSem);
            date.setDate(startDateSem.getDate() + startOffset + dayOffset);
            
            const dd = date.getDate().toString().padStart(2, '0');
            const mm = (date.getMonth() + 1).toString().padStart(2, '0');
            const yyyy = date.getFullYear();
            const dateDayStr = `${dd}/${mm}/${yyyy} ${dayNames[dayId]}`;

            (cleanLogsByDay[dayId] || []).forEach(l => {
                flatLogs.push({
                    ...l,
                    dateDay: dateDayStr
                });
            });
        });

        await db.collection("weekly_forms").doc(`${traineeUid}_logHarian_${weekNum}`).set({
            traineeId: traineeUid,
            type: "logHarian",
            weekNumber: String(weekNum),
            logs: flatLogs,
            logsByDay: cleanLogsByDay,
            f2fIndiv: String(weekF2FIndiv),
            f2fKelompok: String(weekF2FKelompok),
            profAct: String(weekProfAct),
            admin: String(weekAdmin),
            profDev: String(weekProfDev),
            supervision: String(weekSupervision),
            updatedAt: new Date()
        });

        // 2. Save Rumusan Mingguan Form
        const startDateSem = new Date(2026, 2, 9);
        const startOffset = (weekNum - 1) * 7;
        const monday = new Date(startDateSem);
        monday.setDate(startDateSem.getDate() + startOffset);
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        
        const formatLocal = (d) => {
            const y = d.getFullYear();
            const m = (d.getMonth() + 1).toString().padStart(2, '0');
            const day = d.getDate().toString().padStart(2, '0');
            return `${y}-${m}-${day}`;
        };

        await db.collection("weekly_forms").doc(`${traineeUid}_rumusanMingguan_${weekNum}`).set({
            traineeId: traineeUid,
            type: "rumusanMingguan",
            weekNumber: String(weekNum),
            startDate: formatLocal(monday),
            endDate: formatLocal(sunday),
            matrix,
            updatedAt: new Date()
        });
    }

    console.log("Import completed successfully!");
}

run().catch(console.error);
