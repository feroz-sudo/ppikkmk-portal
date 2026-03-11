"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
    User,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult,
    browserPopupRedirectResolver,
    signOut as firebaseSignOut
} from "firebase/auth";
import { auth, db } from "@/lib/firebase/config";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

export interface UserProfile {
    uid: string;
    name: string;
    email: string;
    role: "trainee" | "supervisor" | "admin";
    programType: "practicum" | "internship" | null;
    matricNumber: string;
    assignedSupervisorId?: string;
}

interface AuthContextType {
    user: User | null;
    userRole: "trainee" | "supervisor" | "admin" | null;
    userProfile: UserProfile | null;
    loading: boolean;
    signInWithGoogle: (program: "practicum" | "internship" | "supervisor") => Promise<void>;
    signOut: () => Promise<void>;
    updateProfile: (name: string, matricNumber: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    userRole: null,
    userProfile: null,
    loading: true,
    signInWithGoogle: async () => { },
    signOut: async () => { },
    updateProfile: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [userRole, setUserRole] = useState<"trainee" | "supervisor" | "admin" | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Handle redirect result for mobile devices
        const checkRedirect = async () => {
            try {
                const result = await getRedirectResult(auth);
                if (result) {
                    const credential = GoogleAuthProvider.credentialFromResult(result);
                    if (credential?.accessToken) {
                        localStorage.setItem("googleDriveToken", credential.accessToken);
                        localStorage.setItem("googleEmail", result.user.email || "");
                        console.log("[Auth] Redirect result processed successfully");
                    }
                }
            } catch (error) {
                console.error("[Auth] Redirect result error:", error);
            }
        };
        checkRedirect();

        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);

            if (currentUser) {
                const userDocRef = doc(db, "users", currentUser.uid);
                const userDoc = await getDoc(userDocRef);

                if (userDoc.exists()) {
                    const data = userDoc.data() as UserProfile;
                    
                    // Auto-fill matricNumber from email if missing for trainees
                    if (data.role === "trainee" && !data.matricNumber && data.email) {
                        const { extractMatricFromEmail } = await import("@/lib/drive/saveToDrive");
                        data.matricNumber = extractMatricFromEmail(data.email);
                    }
                    
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

    const updateProfile = async (name: string, matricNumber: string) => {
        if (!user) return;
        try {
            const { updateUserProfile } = await import("@/lib/firebase/db");
            await updateUserProfile(user.uid, { name, matricNumber });
            
            // Re-fetch profile to update state
            const userDocRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
                setUserProfile(userDoc.data() as UserProfile);
            }
        } catch (error) {
            console.error("Failed to update profile", error);
            throw error;
        }
    };

    /**
     * Sign in with Google and set programType based on which button the user clicked.
     * @param program  "practicum" | "internship" | "supervisor"
     */
    const signInWithGoogle = async (program: "practicum" | "internship" | "supervisor") => {
        const provider = new GoogleAuthProvider();
        provider.addScope("https://www.googleapis.com/auth/drive.file");
        // Force consent screen to ensure Drive permissions are requested if not already granted
        provider.setCustomParameters({ 
            prompt: 'select_account',
            access_type: 'offline' 
        });
        try {
            // Helper to detect mobile devices
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

            if (isMobile) {
                console.log("[Auth] Mobile detected, using signInWithRedirect...");
                await signInWithRedirect(auth, provider, browserPopupRedirectResolver);
                // The page will redirect, so nothing more happens here
                return;
            }

            console.log("[Auth] Desktop detected, using signInWithPopup...");
            const result = await signInWithPopup(auth, provider);
            const credential = GoogleAuthProvider.credentialFromResult(result);
            if (credential?.accessToken) {
                localStorage.setItem("googleDriveToken", credential.accessToken);
                localStorage.setItem("googleEmail", result.user.email || "");
            }

            const currentUser = result.user;
            const email = currentUser.email || "";

            // 1. Admin Whitelist (Bypass domain checks)
            const adminEmails = ["ferozsamad@gmail.com", "ahmadferoz@upsi.edu.my"];
            const isAdmin = adminEmails.includes(email);

            // 2. Domain Validation
            if (!isAdmin) {
                if (program === "supervisor" && !email.endsWith("@fpm.upsi.edu.my")) {
                    await firebaseSignOut(auth);
                    throw new Error("SUPERVISOR ACCESS DENIED: Only @fpm.upsi.edu.my emails are authorized for supervisor accounts.");
                }
                if ((program === "practicum" || program === "internship") && !email.endsWith("@siswa.upsi.edu.my")) {
                    await firebaseSignOut(auth);
                    throw new Error("TRAINEE ACCESS DENIED: Only @siswa.upsi.edu.my emails are authorized for trainees.");
                }
            }

            const role: "trainee" | "supervisor" | "admin" = isAdmin ? "admin" : (program === "supervisor" ? "supervisor" : "trainee");
            const programType: "practicum" | "internship" | null = (isAdmin || program === "supervisor") ? null : program;

            const userDocRef = doc(db, "users", currentUser.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                await updateDoc(userDocRef, { role, programType });
            } else {
                const { extractMatricFromEmail } = await import("@/lib/drive/saveToDrive");
                const initialMatric = extractMatricFromEmail(email);

                await setDoc(userDocRef, {
                    uid: currentUser.uid,
                    name: currentUser.displayName,
                    email: currentUser.email,
                    role,
                    programType,
                    matricNumber: initialMatric,
                    assignedSupervisorId: ""
                });
            }
        } catch (error: any) {
            console.error("DEBUG: Firebase Auth Error:", error);
            if (error.code === "auth/unauthorized-domain") {
                alert("DOMAIN ERROR: Please add this exact URL to Firebase Authorized Domains.");
            } else if (error.code === "auth/popup-blocked" || error.message?.includes("Cross-Origin-Opener-Policy")) {
                alert("POPUP BLOCKED: Your browser blocked the login window. Please enable popups or try a different browser.");
            } else {
                alert("Login Error: " + error.message);
            }
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
        <AuthContext.Provider value={{ user, userRole, userProfile, loading, signInWithGoogle, signOut, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
};
