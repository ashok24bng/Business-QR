// Import Firebase Modular SDK
import { getApps, initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
    getAuth,
    onAuthStateChanged,
    updateProfile,
    updateEmail,
    updatePassword,
    signOut
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import {
    getFirestore,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyBhUSWi8CfYzuKjTI_Ep_h6BkQT51GEjjw",
    authDomain: "business-qr-51b78.firebaseapp.com",
    databaseURL: "https://business-qr-51b78-default-rtdb.firebaseio.com",
    projectId: "business-qr-51b78",
    storageBucket: "business-qr-51b78.appspot.com",
    messagingSenderId: "484306511086",
    appId: "1:484306511086:web:2b721ce83d72220dc8bfff",
    measurementId: "G-RKCQV6ER06"
  };

// ✅ Safe Firebase Initialization
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

// DOM Elements
const userName = document.getElementById('user-name');
const userEmail = document.getElementById('user-email');
const totalEarnings = document.getElementById('total-earnings');
const totalWithdrawals = document.getElementById('total-withdrawals');
const totalQRs = document.getElementById('total-qrs');
const editProfileForm = document.getElementById('edit-profile-form');
const changePasswordForm = document.getElementById('change-password-form');
const logoutButton = document.getElementById('logout');

// ✅ SweetAlert2 Alert Helper
function showAlert(message, isSuccess = true) {
    Swal.fire({
        icon: isSuccess ? 'success' : 'error',
        title: isSuccess ? 'Success' : 'Error',
        text: message,
        confirmButtonColor: isSuccess ? '#3085d6' : '#d33'
    });
}

// Auth State Listener
onAuthStateChanged(auth, async (user) => {
    if (user) {
        userName.textContent = user.displayName || 'User';
        userEmail.textContent = user.email;
        await fetchAndDisplayProfileData(user.uid);
        await updateProfileStats(user.uid);
    } else {
        window.location.href = 'index.html';
    }
});

// Fetch & Display Profile Data
async function fetchAndDisplayProfileData(uid) {
    try {
        const userDoc = await getDoc(doc(db, "users", uid));
        if (userDoc.exists()) {
            const userData = userDoc.data();
            document.getElementById('edit-name').value = userData.name || '';
            document.getElementById('edit-email').value = userData.email || '';
            document.getElementById('edit-phone').value = userData.phone || '';
            document.getElementById('edit-bank').value = userData.bank || '';
            document.getElementById('edit-ifsc').value = userData.ifsc || '';
            document.getElementById('edit-account').value = userData.account || '';
            document.getElementById('edit-holder').value = userData.holder || '';
        }
    } catch (error) {
        showAlert("Error fetching profile data: " + error.message, false);
    }
}

// Update Profile Stats (QRs, Earnings, Withdrawals)
async function updateProfileStats(uid) {
    try {
        const userDoc = await getDoc(doc(db, "users", uid));
        if (userDoc.exists()) {
            const data = userDoc.data();
            totalQRs.textContent = data.totalQRs || 0;
            totalEarnings.textContent = `₹${data.totalEarnings || 0}`;
            totalWithdrawals.textContent = `₹${data.totalWithdrawals || 0}`;
        }
    } catch (error) {
        showAlert("Error updating stats: " + error.message, false);
    }
}

// Edit Profile Handler
if (editProfileForm) {
    editProfileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const user = auth.currentUser;
        if (!user) return;

        const newName = document.getElementById('edit-name').value.trim();
        const newEmail = document.getElementById('edit-email').value.trim();
        const newPhone = document.getElementById('edit-phone').value.trim();
        const newBank = document.getElementById('edit-bank').value.trim();
        const newIFSC = document.getElementById('edit-ifsc').value.trim();
        const newAccount = document.getElementById('edit-account').value.trim();
        const newHolder = document.getElementById('edit-holder').value.trim();

        try {
            await updateProfile(user, { displayName: newName });

            if (newEmail !== user.email) {
                await updateEmail(user, newEmail);
            }

            await setDoc(doc(db, "users", user.uid), {
                name: newName,
                email: newEmail,
                phone: newPhone,
                bank: newBank,
                ifsc: newIFSC,
                account: newAccount,
                holder: newHolder,
                updatedAt: serverTimestamp()
            }, { merge: true });

            showAlert("Profile updated successfully!");
            await fetchAndDisplayProfileData(user.uid);
        } catch (error) {
            showAlert("Error updating profile: " + error.message, false);
        }
    });
}

// Change Password Handler
if (changePasswordForm) {
    changePasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const user = auth.currentUser;
        if (!user) return;

        const newPassword = document.getElementById('new-password').value.trim();
        const confirmPassword = document.getElementById('confirm-password').value.trim();

        if (newPassword !== confirmPassword) {
            showAlert("Passwords do not match!", false);
            return;
        }

        try {
            await updatePassword(user, newPassword);
            showAlert("Password changed successfully!");
            changePasswordForm.reset();
        } catch (error) {
            showAlert("Error changing password: " + error.message, false);
        }
    });
}

// Logout Handler
if (logoutButton) {
    logoutButton.addEventListener('click', async () => {
        try {
            await signOut(auth);
            window.location.href = 'index.html';
        } catch (error) {
            showAlert("Error logging out: " + error.message, false);
        }
    });
}
