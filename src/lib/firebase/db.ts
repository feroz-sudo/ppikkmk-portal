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
    onSnapshot
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
    onSnapshot
};

// --- Types ---
export interface User {
    uid: string;
    name: string;
    email: string;
    role: 'trainee' | 'supervisor';
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
    | 'Individual Counselling'
    | 'Group Counselling'
    | 'PFA/MHPSS'
    | 'Management/Admin'
    | 'Professional Development';

export interface Log {
    id?: string;
    traineeId: string;
    date: string; // YYYY-MM-DD
    category: LogCategory;
    hours: number;
    description: string;
    sessionId?: string; // Reference to clinical session
    status?: 'pending' | 'verified' | 'rejected' | 'revision_requested';
    verifiedBy?: string;
    verificationDate?: Timestamp | Date;
    createdAt?: Timestamp | Date;
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
    } else if (session.formType === 'Form8') {
        category = 'PFA/MHPSS';
    } else if (session.formType === 'Form7') {
        category = 'Management/Admin';
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
