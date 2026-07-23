const fs = require("fs");
const path = require("path");

const content = fs.readFileSync(path.join(__dirname, "../public/LOG HARIAN.md"), "utf-8");
const lines = content.split("\n");

let currentWeek = 0;
let currentDayId = "";
let currentDayLabel = "";
let currentDayDate = "";

const weeklyData = {};

const dayNameMap = {
    monday: "mon", tuesday: "tue", wednesday: "wed", thursday: "thu", friday: "fri", saturday: "sat", sunday: "sun",
    isnin: "mon", selasa: "tue", rabu: "wed", khamis: "thu", jumaat: "fri", sabtu: "sat", ahad: "sun"
};

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

function determineCategory(activity, location) {
    const act = activity.toLowerCase();
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
    if (act.includes("psychoeducation") || act.includes("psikopendidikan") || act.includes("talk") || act.includes("outreach") || act.includes("poster") || act.includes("proposal") || act.includes("broadcast")) {
        return CATEGORIES.PSYCHO;
    }
    if (act.includes("inventory") || act.includes("inventori") || act.includes("testing") || act.includes("assessment") || act.includes("ujian") || act.includes("sidek") || act.includes("saringan")) {
        return CATEGORIES.TEST;
    }
    if (act.includes("supervision") || act.includes("penyeliaan") || act.includes("meeting with supervisor") || act.includes("supervisor")) {
        return CATEGORIES.SUPERVISION;
    }
    if (act.includes("professional development") || act.includes("webinar") || act.includes("reading") || act.includes("read") || act.includes("literatur")) {
        return CATEGORIES.DEV;
    }
    return CATEGORIES.ADMIN;
}

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

let parsedCount = 0;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const weekMatch = line.match(/MINGGU KE:\s*(\d+)/i);
    if (weekMatch) {
        currentWeek = parseInt(weekMatch[1]);
        if (!weeklyData[currentWeek]) {
            weeklyData[currentWeek] = {
                logsByDay: { mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] },
                f2fIndiv: 0, f2fKelompok: 0, profAct: 0, admin: 0, profDev: 0, supervision: 0
            };
        }
        console.log(`Detected week: ${currentWeek}`);
        if (!line.includes("BUKU LOG HARIAN")) {
            continue;
        }
    }

    const dayHeaderMatch = line.match(/BUKU LOG HARIAN.*?(MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY|SUNDAY|ISNIN|SELASA|RABU|KHAMIS|JUMAAT|SABTU|AHAD).*?(\d{2}\/\d{2}\/\d{4})/i);
    if (dayHeaderMatch) {
        const dayLabel = dayHeaderMatch[1];
        currentDayLabel = dayLabel;
        currentDayId = dayNameMap[dayLabel.toLowerCase()] || "mon";
        const rawDate = dayHeaderMatch[2];
        const parts = rawDate.split("/");
        currentDayDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
        console.log(`  Detected day: ${currentDayLabel} (${currentDayDate})`);
        continue;
    }

    if (line.startsWith("|")) {
        if (line.toLowerCase().includes("lokasi") || line.includes("---")) continue;
        const cols = line.split("|").map(s => s.trim());
        if (cols.length >= 5) {
            const location = cols[1];
            const timeRange = cols[2];
            const activity = cols[3];
            const notes = cols[4];

            if (!location && !timeRange && !activity) continue;

            const category = determineCategory(activity, location || "");
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
                parsedCount++;
            } else {
                console.log(`  Row skipped (missing currentWeek/day): week=${currentWeek}, day=${currentDayId}`);
            }
        }
    }
}

console.log(`Total parsed entries: ${parsedCount}`);
console.log("Weeks parsed:", Object.keys(weeklyData));
