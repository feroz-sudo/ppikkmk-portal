import { db } from "../firebase/config";
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
  orderBy,
  serverTimestamp,
  Timestamp
} from "firebase/firestore";

// --- Internship Types ---
export interface InternshipFormEntry {
  id?: string;
  formCode: string;          // e.g. "FORM 04"
  formTitle: string;         // e.g. "CLIENT REGISTRATION FORM"
  traineeId: string;         // User UID
  traineeName: string;
  matricNumber: string;
  formData: Record<string, any>; // Dynamic per-field values
  pdfPath?: string;          // Static reference to original PDF
  status: "draft" | "submitted" | "approved";
  createdAt?: Timestamp | Date;
  updatedAt?: Timestamp | Date;
}

export interface InternshipLogEntry {
  id?: string;
  weekNumber: number;        // Week 1 - 28
  date: string;              // YYYY-MM-DD
  day: string;               // Monday - Sunday
  traineeId: string;
  activityDescription: string;
  directHours: number;       // Direct client hours
  indirectHours: number;     // Supervision & admin hours
  supervisorVerification: boolean;
  createdAt?: Timestamp | Date;
}

// Collection References (Isolated from Practicum)
const INTERNSHIP_FORMS_COLLECTION = "internship_forms";
const INTERNSHIP_LOGS_COLLECTION = "internship_logs";

/**
 * Save or update an Internship Clinical Form entry
 */
export async function saveInternshipForm(entry: Omit<InternshipFormEntry, "id" | "createdAt"> & { id?: string }) {
  if (entry.id) {
    const docRef = doc(db, INTERNSHIP_FORMS_COLLECTION, entry.id);
    await updateDoc(docRef, {
      ...entry,
      updatedAt: serverTimestamp()
    });
    return entry.id;
  } else {
    const colRef = collection(db, INTERNSHIP_FORMS_COLLECTION);
    const res = await addDoc(colRef, {
      ...entry,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return res.id;
  }
}

/**
 * Fetch all filled Internship Clinical Forms for a specific trainee
 */
export async function getTraineeInternshipForms(traineeId: string): Promise<InternshipFormEntry[]> {
  const q = query(
    collection(db, INTERNSHIP_FORMS_COLLECTION),
    where("traineeId", "==", traineeId),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(docSnap => ({
    id: docSnap.id,
    ...docSnap.data()
  })) as InternshipFormEntry[];
}

/**
 * Save or update an Internship Logbook entry
 */
export async function saveInternshipLog(entry: Omit<InternshipLogEntry, "id" | "createdAt"> & { id?: string }) {
  if (entry.id) {
    const docRef = doc(db, INTERNSHIP_LOGS_COLLECTION, entry.id);
    await updateDoc(docRef, {
      ...entry,
      updatedAt: serverTimestamp()
    });
    return entry.id;
  } else {
    const colRef = collection(db, INTERNSHIP_LOGS_COLLECTION);
    const res = await addDoc(colRef, {
      ...entry,
      createdAt: serverTimestamp()
    });
    return res.id;
  }
}

/**
 * Fetch all 28-Week Internship Logbook entries for a trainee
 */
export async function getTraineeInternshipLogs(traineeId: string): Promise<InternshipLogEntry[]> {
  const q = query(
    collection(db, INTERNSHIP_LOGS_COLLECTION),
    where("traineeId", "==", traineeId),
    orderBy("weekNumber", "asc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(docSnap => ({
    id: docSnap.id,
    ...docSnap.data()
  })) as InternshipLogEntry[];
}
