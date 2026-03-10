import { db } from "./config";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    where,
    addDoc,
    updateDoc,
    deleteDoc,
    Timestamp,
    orderBy,
    serverTimestamp,
    setDoc,
    onSnapshot,
    limit
} from "firebase/firestore";

export {
    db,
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    where,
    addDoc,
    updateDoc,
    deleteDoc,
    Timestamp,
    orderBy,
    serverTimestamp,
    setDoc,
    onSnapshot,
    limit
};

// --- Types ---
export interface User {
    uid: string;
    name: string;
    email: string;
    role: 'trainee' | 'supervisor' | 'admin';
    programType: 'practicum' | 'internship' | null;
    matricNumber?: string;
    assignedSupervisorId?: string;
    clinicalStatus?: 'active' | 'completed' | 'archived';
    academicSession?: string;
}

export interface TraineeMarks {
    id?: string;
    traineeId: string;
    supervisorId: string;
    faceToFace: {
        individual: number; // Max 25 (Target 60h)
        group: number;      // Max 15 (Target 36h)
    };
    professionalActivities: number; // Max 25 (Target 90h Psychoeducation/Consultation)
    managementAdmin: number;        // Max 20 (Target 52h Logbook/Reflections)
    professionalDevelopment: number; // Max 5 (Target 14h)
    professionalIdentity: number;   // Max 10 (Sahsiah/Personality)
    total: number; // Max 100
    comments?: string;
    updatedAt: Timestamp | Date;
}

export interface Client {
    id?: string;
    clientId: string; // E.g., The running number like 001
    type: 'KI' | 'KK';
    traineeId: string;
    demographics: {
        name: string; // Functions as "Client File Name"
        age?: number;
        gender?: string;
        contactNumber?: string;
        address?: string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [key: string]: any;
    };
    status?: string;
    createdAt: Timestamp | Date;
}

export interface Session {
    id?: string;
    sessionId: string; // The session number for this client
    clientId: string; // The reference to the Client document ID
    traineeId: string;
    date: Timestamp | Date;
    duration: number; // in hours or minutes
    formType: 'Form1' | 'Form2' | 'Form3' | 'Form4' | 'Form5' | 'Form6' | 'Form7' | 'Form8' | 'Form11' | 'Form13';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    formData: any;
    status?: 'pending' | 'verified' | 'rejected' | 'revision_requested';
    supervisorFeedback?: string;
    verifiedBy?: string;
    verificationDate?: Timestamp | Date;
    createdAt?: Timestamp | Date;
}

export interface AttendanceSignOff {
    id?: string;
    traineeId: string;
    supervisorId: string;
    weekStartDate: string; // YYYY-MM-DD
    totalHours: number;
    status: 'pending' | 'signed';
    supervisorSignature?: string; // Base64 or URL
    signedDate?: Timestamp | Date;
    createdAt: Timestamp | Date;
}

export interface ClinicalRecording {
    id?: string;
    traineeId: string;
    clientId: string;
    sessionId: string;
    type: 'KI' | 'KK';
    storagePath: string;
    feedback?: string;
    status: 'pending' | 'reviewed';
    createdAt: Timestamp | Date;
}

export type LogCategory =
    | 'Individual Counselling'    // a
    | 'Group Counselling'         // b
    | 'Crisis Intervention'       // c
    | 'PFA/MHPSS'                 // d
    | 'Psychoeducation/Community' // e
    | 'Testing & Assessment'      // f
    | 'Management & Admin'        // g
    | 'Professional Development'  // h
    | 'Supervision';              // i

export interface Log {
    id?: string;
    traineeId: string;
    date: string; // YYYY-MM-DD
    category: LogCategory;
    hours: number;
    description: string;
    location?: string;   // PDF: Lokasi
    startTime?: string;  // PDF: Masa (From)
    endTime?: string;    // PDF: Masa (To)
    sessionId?: string;  // Reference to clinical session
    status?: 'pending' | 'verified' | 'rejected' | 'revision_requested';
    verifiedBy?: string;
    verificationDate?: Timestamp | Date;
    createdAt?: Timestamp | Date;
}

export interface TraineeProfile {
    uid: string;
    fullName: string;
    matricNumber: string;
    icNumber: string;
    address: string;
    phone: string;
    email: string;
    practicumSite: string;
    siteAddress: string;
    emergencyContact: string; // Name & Phone
    updatedAt: Timestamp | Date;
}

export interface PracticumContract {
    traineeId: string;
    internshipSite: string;
    semesterYear: string;
    localPreceptor: {
        name: string;
        phone: string;
        email: string;
    };
    academicSupervisor: {
        name: string;
        phone: string;
        email: string;
    };
    practicumCoordinator: {
        name: string;
        email: string;
    };
    startDate: string;
    endDate: string;
    isAgreed: boolean;
    traineeSignatureDate?: string;
    preceptorSignatureDate?: string;
    supervisorSignatureDate?: string;
    updatedAt: Timestamp | Date;
}

export interface WeeklyReflection {
    id?: string;
    traineeId: string;
    weekNumber: number; // 1-16
    reflections: {
        individualCounselling: string;
        groupCounselling: string;
        activitiesIntervention: string;
        adminManagement: string;
        professionalDevelopment: string;
        supervision: string;
    };
    status: 'pending' | 'reviewed';
    supervisorFeedback?: string;
    updatedAt: Timestamp | Date;
}

export interface Supervision {
    id?: string;
    traineeId: string;
    supervisorId: string;
    type: 'Campus' | 'Site' | 'Online';
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    date: Timestamp | Date;
    proposedTime: string;
    traineeNotes?: string;
    supervisorNotes?: string;
    linkedClientId?: string;
    createdAt: Timestamp | Date;
}

// --- Collections ---
export const usersRef = collection(db, "users");
export const clientsRef = collection(db, "clients");
export const sessionsRef = collection(db, "sessions");
export const logsRef = collection(db, "logs");
export const supervisionsRef = collection(db, "supervisions");
export const attendanceRef = collection(db, "attendance_signoffs");
export const recordingsRef = collection(db, "clinical_recordings");
export const marksRef = collection(db, "marks");
export const profilesRef = collection(db, "trainee_profiles");
export const contractsRef = collection(db, "practicum_contracts");
export const reflectionsRef = collection(db, "weekly_reflections");

// --- Services ---

// Supervisions
export const addSupervisionRequest = async (request: Omit<Supervision, "id" | "createdAt">) => {
    return await addDoc(supervisionsRef, {
        ...request,
        createdAt: new Date()
    });
};

export const getTraineeSupervisions = async (traineeId: string): Promise<Supervision[]> => {
    const q = query(supervisionsRef, where("traineeId", "==", traineeId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Supervision));
};

export const getSupervisorPendingRequests = async (supervisorId: string): Promise<Supervision[]> => {
    const q = query(supervisionsRef, where("supervisorId", "==", supervisorId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Supervision));
};

export const updateSupervisionStatus = async (id: string, status: Supervision['status'], notes?: string) => {
    const docRef = doc(db, "supervisions", id);
    await updateDoc(docRef, {
        status,
        ...(notes ? { supervisorNotes: notes } : {}),
        updatedAt: new Date()
    });
};

// Users
export const getUser = async (uid: string): Promise<User | null> => {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as User) : null;
};

// Logs
export const addLogEntry = async (log: Omit<Log, "createdAt" | "status">) => {
    return await addDoc(logsRef, {
        ...log,
        status: 'pending',
        createdAt: new Date()
    });
};

export const getTraineeLogs = async (traineeId: string): Promise<Log[]> => {
    const q = query(logsRef, where("traineeId", "==", traineeId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Log));
};

export const deleteLogEntry = async (logId: string) => {
    await deleteDoc(doc(db, "logs", logId));
};

export const updateLogEntry = async (logId: string, log: Partial<Log>) => {
    const docRef = doc(db, "logs", logId);
    await updateDoc(docRef, {
        ...log,
        updatedAt: new Date()
    });
};

// Clients
export const addClient = async (client: Omit<Client, "createdAt">) => {
    return await addDoc(clientsRef, {
        ...client,
        createdAt: new Date()
    });
};

export const getTraineeClients = async (traineeId: string): Promise<Client[]> => {
    const q = query(clientsRef, where("traineeId", "==", traineeId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client));
};

// Sessions
export const addSession = async (session: Omit<Session, "createdAt" | "status">) => {
    return await addDoc(sessionsRef, {
        ...session,
        status: 'pending',
        createdAt: new Date()
    });
};

export const getClientSessions = async (clientId: string): Promise<Session[]> => {
    const q = query(sessionsRef, where("clientId", "==", clientId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Session));
};

export const getTraineeSessions = async (traineeId: string): Promise<Session[]> => {
    const q = query(sessionsRef, where("traineeId", "==", traineeId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Session));
};

export const getTraineeSupervisionRequests = async (traineeId: string): Promise<Supervision[]> => {
    const q = query(collection(db, "supervisions"), where("traineeId", "==", traineeId), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Supervision));
};

export const updateSession = async (sessionId: string, data: Partial<Session>) => {
    const docRef = doc(db, "sessions", sessionId);
    await updateDoc(docRef, data);
};

// Automation: Sync Session with Logbook
export const syncSessionWithLog = async (session: Session & { id: string }) => {
    // 1. Determine category
    let category: LogCategory | null = null;
    if (session.formType === 'Form1' || session.formType === 'Form2' || session.formType === 'Form3' || session.formType === 'Form4' || session.formType === 'Form5' || session.formType === 'Form13') {
        category = 'Individual Counselling';
    } else if (session.formType === 'Form11') {
        category = 'Group Counselling';
    } else if (session.formType === 'Form7') {
        category = 'Management & Admin';
    }

    if (!category) return;

    // 2. Check if log already exists for this session
    const q = query(logsRef, where("sessionId", "==", session.id));
    const snap = await getDocs(q);

    const dateStr = session.date instanceof Date
        ? session.date.toISOString().split('T')[0]
        : (session.date as any).toDate().toISOString().split('T')[0];

    const logData: Omit<Log, "id"> = {
        traineeId: session.traineeId,
        date: dateStr,
        category,
        hours: session.duration || 1.0,
        description: `Clinical Session: ${session.formType} - ${session.sessionId}`,
        sessionId: session.id,
        status: session.status || 'pending'
    };

    if (!snap.empty) {
        // Update existing log
        const logId = snap.docs[0].id;
        await updateDoc(doc(db, "logs", logId), {
            ...logData,
            updatedAt: new Date()
        });
    } else {
        // Create new log
        await addDoc(logsRef, {
            ...logData,
            createdAt: new Date()
        });
    }
};

// Recordings Hub
export const addRecording = async (recording: Omit<ClinicalRecording, "id" | "createdAt">) => {
    return await addDoc(recordingsRef, {
        ...recording,
        createdAt: new Date()
    });
};

export const getTraineeRecordings = async (traineeId: string): Promise<ClinicalRecording[]> => {
    const q = query(recordingsRef, where("traineeId", "==", traineeId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ClinicalRecording));
};

export const updateRecordingFeedback = async (id: string, feedback: string) => {
    const docRef = doc(db, "clinical_recordings", id);
    await updateDoc(docRef, {
        feedback,
        status: 'reviewed',
        updatedAt: new Date()
    });
};

// Attendance Hub
export const getTraineeAttendance = async (traineeId: string): Promise<AttendanceSignOff[]> => {
    const q = query(attendanceRef, where("traineeId", "==", traineeId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AttendanceSignOff));
};

export const signOffAttendance = async (id: string, supervisorId: string, signature: string) => {
    const docRef = doc(db, "attendance_signoffs", id);
    await updateDoc(docRef, {
        status: 'signed',
        supervisorSignature: signature,
        signedDate: new Date(),
        verifiedBy: supervisorId
    });
};

// Marks System
export const getTraineeMarks = async (traineeId: string): Promise<TraineeMarks | null> => {
    const q = query(marksRef, where("traineeId", "==", traineeId));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as TraineeMarks;
};

export const saveTraineeMarks = async (marks: Omit<TraineeMarks, "id" | "updatedAt">) => {
    const q = query(marksRef, where("traineeId", "==", marks.traineeId));
    const snapshot = await getDocs(q);

    const data = {
        ...marks,
        updatedAt: new Date()
    };

    if (snapshot.empty) {
        await addDoc(marksRef, data);
    } else {
        await updateDoc(doc(db, "marks", snapshot.docs[0].id), data);
    }
};

// Trainee Management
export const findTraineeByEmail = async (email: string): Promise<User | null> => {
    const q = query(usersRef, where("email", "==", email), where("role", "==", "trainee"));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return { uid: snapshot.docs[0].id, ...snapshot.docs[0].data() } as User;
};

export const updateTraineeSupervisor = async (traineeUid: string, supervisorUid: string | null) => {
    const docRef = doc(db, "users", traineeUid);
    await updateDoc(doc(db, "users", traineeUid), {
        assignedSupervisorId: supervisorUid
    });
};

// Trainee Profile
export const getTraineeProfile = async (uid: string): Promise<TraineeProfile | null> => {
    const docRef = doc(db, "trainee_profiles", uid);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as TraineeProfile) : null;
};

export const saveTraineeProfile = async (profile: TraineeProfile) => {
    const docRef = doc(db, "trainee_profiles", profile.uid);
    await setDoc(docRef, { ...profile, updatedAt: new Date() });
};

// Practicum Contract
export const getPracticumContract = async (traineeId: string): Promise<PracticumContract | null> => {
    const q = query(contractsRef, where("traineeId", "==", traineeId));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty ? (querySnapshot.docs[0].data() as PracticumContract) : null;
};

export const savePracticumContract = async (contract: PracticumContract) => {
    const q = query(contractsRef, where("traineeId", "==", contract.traineeId));
    const snap = await getDocs(q);
    const data = { ...contract, updatedAt: new Date() };

    if (!snap.empty) {
        await updateDoc(doc(db, "practicum_contracts", snap.docs[0].id), data);
    } else {
        await addDoc(contractsRef, data);
    }
};

// Weekly Reflection
export const getWeeklyReflection = async (traineeId: string, weekNumber: number): Promise<WeeklyReflection | null> => {
    const q = query(reflectionsRef, where("traineeId", "==", traineeId), where("weekNumber", "==", weekNumber));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty ? ({ id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() } as WeeklyReflection) : null;
};

export const saveWeeklyReflection = async (reflection: Omit<WeeklyReflection, "id" | "updatedAt" | "status">) => {
    const q = query(reflectionsRef, where("traineeId", "==", reflection.traineeId), where("weekNumber", "==", reflection.weekNumber));
    const snap = await getDocs(q);
    const data = { ...reflection, status: 'pending', updatedAt: new Date() };

    if (!snap.empty) {
        await updateDoc(doc(db, "weekly_reflections", snap.docs[0].id), data);
    } else {
        await addDoc(reflectionsRef, data);
    }
};

// --- Admin Helpers ---

export async function getAllUsers() {
    const q = query(collection(db, "users"), orderBy("name", "asc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as unknown as User));
}

export async function getSystemStats() {
    const [usersSnap, logsSnap, clientsSnap, sessionsSnap] = await Promise.all([
        getDocs(collection(db, "users")),
        getDocs(collection(db, "logs")),
        getDocs(collection(db, "clients")),
        getDocs(collection(db, "sessions"))
    ]);

    const logs = logsSnap.docs.map(doc => doc.data() as Log);
    const totalHours = logs.reduce((sum, log) => sum + (log.hours || 0), 0);

    return {
        totalTrainees: usersSnap.docs.filter(doc => (doc.data() as User).role === 'trainee').length,
        totalSupervisors: usersSnap.docs.filter(doc => (doc.data() as User).role === 'supervisor').length,
        totalHours: Math.round(totalHours),
        totalActivities: logsSnap.size + sessionsSnap.size,
        pendingVerifications: sessionsSnap.docs.filter(doc => (doc.data() as Session).status === 'pending').length
    };
}

export async function getRecentActivities(limitCount = 10) {
    const logsRef = collection(db, "logs");
    const sessionsRef = collection(db, "sessions");

    const [logsSnap, sessionsSnap] = await Promise.all([
        getDocs(query(logsRef, orderBy("date", "desc"), limit(limitCount))),
        getDocs(query(sessionsRef, orderBy("createdAt", "desc"), limit(limitCount)))
    ]);

    const activities = [
        ...logsSnap.docs.map(doc => ({
            id: doc.id,
            type: 'log' as const,
            data: doc.data() as Log,
            timestamp: doc.data().date instanceof Timestamp ? doc.data().date.toDate() : new Date(doc.data().date)
        })),
        ...sessionsSnap.docs.map(doc => ({
            id: doc.id,
            type: 'session' as const,
            data: doc.data() as Session,
            timestamp: doc.data().createdAt instanceof Timestamp ? doc.data().createdAt.toDate() : new Date(doc.data().createdAt || 0)
        }))
    ];

    return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, limitCount);
}
