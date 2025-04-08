import { auth, db } from './firebase-config.js';
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Function to fetch and display user data
async function fetchAndDisplayUserData() {
    try {
        console.log('Starting to fetch user data...');
        const user = auth.currentUser;
        console.log('Current user:', user);
        
        if (!user) {
            console.log('No user logged in');
            window.location.href = 'index.html';
            return;
        }

        // Get user document from Firestore
        const userRef = doc(db, 'users', user.uid);
        console.log('Fetching user document for UID:', user.uid);
        
        const userDoc = await getDoc(userRef);
        console.log('User document exists:', userDoc.exists());
        
        if (!userDoc.exists()) {
            console.log('Creating new user document...');
            // Create initial user data
            const initialUserData = {
                fullName: user.displayName || 'User',
                email: user.email,
                createdAt: new Date(),
                stats: {
                    totalQRCodes: 0,
                    workedDays: 0
                },
                wallet: {
                    earning: 0,
                    balance: 0
                },
                plan: {
                    name: 'Free Trial',
                    startDate: new Date()
                }
            };
            
            await setDoc(userRef, initialUserData);
            console.log('New user document created');
            
            // Update UI with initial data
            updateUI(initialUserData, user);
        } else {
            const userData = userDoc.data();
            console.log('User data to display:', userData);
            updateUI(userData, user);
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
    }
}

// Function to update UI with user data
function updateUI(userData, user) {
    // Update user info
    const userNameElement = document.getElementById('userName');
    const userEmailElement = document.getElementById('userEmail');
    
    if (userNameElement) {
        // Extract name from email if fullName is not set
        const displayName = userData.fullName || user.email.split('@')[0];
        userNameElement.textContent = displayName;
        console.log('Updated user name to:', displayName);
    }
    
    if (userEmailElement) {
        userEmailElement.textContent = user.email;
        console.log('Updated user email to:', user.email);
    }
    
    // Update stats
    const totalQRCodesElement = document.getElementById('totalQRCodes') || document.getElementById('totalQRCount');
    const totalEarningsElement = document.getElementById('totalEarnings') || document.getElementById('totalEarningsValue');
    const workedDaysElement = document.getElementById('workedDays');
    const currentPlanElement = document.getElementById('currentPlan');
    
    if (totalQRCodesElement) {
        totalQRCodesElement.textContent = userData.stats?.totalQRCodes || 0;
        console.log('Updated total QR codes to:', userData.stats?.totalQRCodes || 0);
    }
    
    if (totalEarningsElement) {
        totalEarningsElement.textContent = `₹${(userData.wallet?.earning || 0).toFixed(2)}`;
        console.log('Updated total earnings to:', `₹${(userData.wallet?.earning || 0).toFixed(2)}`);
    }
    
    if (workedDaysElement) {
        workedDaysElement.textContent = userData.stats?.workedDays || 0;
        console.log('Updated worked days to:', userData.stats?.workedDays || 0);
    }
    
    if (currentPlanElement) {
        currentPlanElement.textContent = userData.plan?.name || 'Free Trial';
        console.log('Updated current plan to:', userData.plan?.name || 'Free Trial');
    }

    // Update profile info if on profile page
    const profileNameElement = document.getElementById('profileName');
    const profileEmailElement = document.getElementById('profileEmail');
    const profilePlanElement = document.getElementById('profilePlan');
    const profileJoinDateElement = document.getElementById('profileJoinDate');
    
    if (profileNameElement) {
        const displayName = userData.fullName || user.email.split('@')[0];
        profileNameElement.textContent = displayName;
        console.log('Updated profile name to:', displayName);
    }
    
    if (profileEmailElement) {
        profileEmailElement.textContent = user.email;
        console.log('Updated profile email to:', user.email);
    }
    
    if (profilePlanElement) {
        profilePlanElement.textContent = `Plan: ${userData.plan?.name || 'Free Trial'}`;
        console.log('Updated profile plan to:', userData.plan?.name || 'Free Trial');
    }
    
    if (profileJoinDateElement) {
        const joinDate = userData.createdAt?.toDate() || new Date();
        profileJoinDateElement.textContent = `Joined: ${joinDate.toLocaleDateString()}`;
        console.log('Updated join date to:', joinDate.toLocaleDateString());
    }
}

// Call the function when the page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded');
    auth.onAuthStateChanged((user) => {
        console.log('Auth state changed:', user);
        if (user) {
            fetchAndDisplayUserData();
        } else {
            window.location.href = 'index.html';
        }
    });
});

// Make the function available globally
window.fetchAndDisplayUserData = fetchAndDisplayUserData; 