"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
    User,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    signOut as firebaseSignOut
} from "firebase/auth";
import { auth, db } from "@/lib/firebase/config";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

export interface UserProfile {
    uid: string;
    name: string;
    email: string;
    role: "trainee" | "supervisor";
    programType: "practicum" | "internship" | null;
    matricNumber: string;
    assignedSupervisorId?: string;
}

interface AuthContextType {
    user: User | null;
    userRole: "trainee" | "supervisor" | null;
    userProfile: UserProfile | null;
    loading: boolean;
    signInWithGoogle: (program: "practicum" | "internship" | "supervisor") => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    userRole: null,
    userProfile: null,
    loading: true,
    signInWithGoogle: async () => { },
    signOut: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [userRole, setUserRole] = useState<"trainee" | "supervisor" | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);

            if (currentUser) {
                const userDocRef = doc(db, "users", currentUser.uid);
                const userDoc = await getDoc(userDocRef);

                if (userDoc.exists()) {
                    const data = userDoc.data() as UserProfile;
                    setUserRole(data.role);
                    setUserProfile(data);
                } else {
                    // New user — will be properly initialised on sign-in button click
                    setUserRole("trainee");
                    setUserProfile(null);
                }
            } else {
                setUserRole(null);
                setUserProfile(null);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    /**
     * Sign in with Google and set programType based on which button the user clicked.
     * @param program  "practicum" | "internship" | "supervisor"
     */
    const signInWithGoogle = async (program: "practicum" | "internship" | "supervisor") => {
        const provider = new GoogleAuthProvider();
        provider.addScope("https://www.googleapis.com/auth/drive.file");
        try {
            const result = await signInWithPopup(auth, provider);
            const credential = GoogleAuthProvider.credentialFromResult(result);
            if (credential?.accessToken) {
                localStorage.setItem("googleDriveToken", credential.accessToken);
            }

            const currentUser = result.user;
            const role: "trainee" | "supervisor" = program === "supervisor" ? "supervisor" : "trainee";
            const programType: "practicum" | "internship" | null = program === "supervisor" ? null : program;

            const userDocRef = doc(db, "users", currentUser.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                // Update programType on every sign-in so switching buttons works
                await updateDoc(userDocRef, { role, programType });
            } else {
                // First sign-in — create user document
                await setDoc(userDocRef, {
                    uid: currentUser.uid,
                    name: currentUser.displayName,
                    email: currentUser.email,
                    role,
                    programType,
                    matricNumber: "",
                    assignedSupervisorId: ""
                });
            }
        } catch (error) {
            console.error("Error signing in with Google", error);
        }
    };

    const signOut = async () => {
        try {
            await firebaseSignOut(auth);
        } catch (error) {
            console.error("Error signing out", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, userRole, userProfile, loading, signInWithGoogle, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};
