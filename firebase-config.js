// Import Firebase modules
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBhUSWi8CfYzuKjTI_Ep_h6BkQT51GEjjw",
    authDomain: "business-qr-51b78.firebaseapp.com",
    projectId: "business-qr-51b78",
    storageBucket: "business-qr-51b78.appspot.com",
    messagingSenderId: "484306511086",
    appId: "1:484306511086:web:2b721ce83d72220dc8bfff",
    measurementId: "G-RKCQV6ER06"
};

// Initialize Firebase (with safe check for multiple initializations)
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/**
 * Logs in a user with email and password
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<User>} Firebase User object
 * @throws {Error} Authentication error
 */
async function loginUser(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error) {
        console.error("Login error:", error);
        throw error;
    }
}

/**
 * Registers a new user with email/password and stores additional data in Firestore
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @param {Object} userData - Additional user data to store in Firestore
 * @returns {Promise<User>} Firebase User object
 * @throws {Error} Registration error
 */
async function registerUser(email, password, userData) {
    try {
        console.log('Starting registration with data:', userData);
        
        // 1. Create authentication record
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log('Auth user created with UID:', user.uid);
        
        // 2. Create Firestore document
        const userRef = doc(db, "users", user.uid);
        await setDoc(userRef, {
            ...userData,
            createdAt: new Date().toISOString(),
            uid: user.uid
        });
        
        // 3. Verify document creation
        const docSnapshot = await getDoc(userRef);
        if (!docSnapshot.exists()) {
            throw new Error("Failed to create user document");
        }
        
        return user;
    } catch (error) {
        console.error('Registration error:', error);
        throw error;
    }
}

// Export Firebase services and functions
export { 
    app,
    auth, 
    db, 
    loginUser,
    registerUser 
};