// Import Firebase modules and functions
import { 
    auth, 
    db, 
    onAuthStateChanged,
    addQRTransaction,
    transferFunds,
    processWithdrawal
} from './firebase-config.js';
import { 
    collection, 
    doc, 
    getDoc, 
    updateDoc, 
    query, 
    where, 
    getDocs,
    onSnapshot,
    serverTimestamp,
    increment
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { onAuthStateChanged as authStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';

// DOM Elements
const userGreeting = document.getElementById('userGreeting');
const userName = document.getElementById('userName');
const userPlan = document.getElementById('userPlan');
const todayQR = document.getElementById('todayQR');
const totalQR = document.getElementById('totalQR');
const todayEarnings = document.getElementById('todayEarnings');
const totalEarnings = document.getElementById('totalEarnings');
const currentQR = document.getElementById('currentQR');
const maxQR = document.getElementById('maxQR');
const dailyProgress = document.getElementById('dailyProgress');
const totalReferrals = document.getElementById('totalReferrals');
const referralEarnings = document.getElementById('referralEarnings');
const recentActivity = document.getElementById('recentActivity');
const loginHistory = document.getElementById('loginHistory');

// Check authentication state
onAuthStateChanged(auth, async (user) => {
    if (user) {
        console.log('User is signed in:', user.email);
        try {
            // Get user data
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                console.log('User data:', userData);
                updateDashboardUI(userData);
        loadTransactions(user.uid);
        loadReferralData(user.uid);
                loadLoginHistory(user.uid);
            } else {
                console.error('No user data found');
            }
        } catch (error) {
            console.error('Error getting user data:', error);
        }
    } else {
        console.log('No user is signed in');
        window.location.href = 'index.html';
    }
});

// Update dashboard UI with user data
function updateDashboardUI(userData) {
    // Update user info
    if (userGreeting) userGreeting.textContent = userData.fullName || 'User';
    if (userName) userName.textContent = userData.fullName || 'User';
    if (userPlan) userPlan.textContent = userData.plan?.name || 'Free Plan';

// Update wallet balances
    if (document.getElementById('earningBalance')) {
        document.getElementById('earningBalance').textContent = `₹${userData.wallet?.earning || 0}`;
    }
    if (document.getElementById('bonusBalance')) {
        document.getElementById('bonusBalance').textContent = `₹${userData.wallet?.bonus || 0}`;
    }
    if (document.getElementById('mainBalance')) {
        document.getElementById('mainBalance').textContent = `₹${userData.wallet?.main || 0}`;
    }

    // Update stats
    if (totalQR) totalQR.textContent = userData.stats?.totalQRCodes || 0;
    if (totalEarnings) totalEarnings.textContent = `₹${userData.stats?.totalEarnings || 0}`;
    if (totalReferrals) totalReferrals.textContent = userData.stats?.totalReferrals || 0;
}

// Load transactions
function loadTransactions(userId) {
    const transactionsRef = collection(db, 'transactions');
    const qrQuery = query(
        transactionsRef, 
        where('userId', '==', userId),
        where('type', '==', 'qr_generation')
    );
    
    onSnapshot(qrQuery, (snapshot) => {
        if (!recentActivity) return;

        if (snapshot.empty) {
            recentActivity.innerHTML = '<div class="no-activity">No recent activity</div>';
            return;
        }

        let html = '';
        snapshot.forEach(doc => {
            const data = doc.data();
            const timeAgo = getTimeAgo(data.timestamp?.toDate());
            
            html += `
                <div class="activity-item">
                    <div class="activity-icon">
                        <i class="fas fa-qrcode"></i>
                    </div>
                    <div class="activity-details">
                        <h4>QR Code Generated</h4>
                        <p>Amount: ₹${data.amount || 0}</p>
                        <small>${timeAgo}</small>
                    </div>
                </div>
                `;
        });
        recentActivity.innerHTML = html;
        });
}

// Load referral data
function loadReferralData(userId) {
    // Get referral count
    const usersRef = collection(db, 'users');
    const referralUsersQuery = query(usersRef, where('referredBy', '==', userId));
    getDocs(referralUsersQuery).then((snapshot) => {
        if (totalReferrals) totalReferrals.textContent = snapshot.size;
    });

    // Get referral earnings
    const transactionsRef = collection(db, 'transactions');
    const referralTransactionsQuery = query(
        transactionsRef, 
        where('userId', '==', userId),
        where('type', '==', 'referral')
    );
    getDocs(referralTransactionsQuery).then((snapshot) => {
        let total = 0;
        snapshot.forEach(doc => {
            total += doc.data().amount || 0;
        });
        if (referralEarnings) referralEarnings.textContent = `₹${total.toFixed(2)}`;
    });
}

// Load login history
function loadLoginHistory(userId) {
    const loginHistoryRef = collection(db, 'user_logins');
    const loginQuery = query(
        loginHistoryRef,
        where('userId', '==', userId),
        where('timestamp', '!=', null)
    );

    onSnapshot(loginQuery, (snapshot) => {
        if (!loginHistory) return;

        if (snapshot.empty) {
            loginHistory.innerHTML = '<div class="no-activity">No login history</div>';
            return;
        }

        let html = '';
        snapshot.forEach(doc => {
            const data = doc.data();
            const timeAgo = getTimeAgo(data.timestamp?.toDate());
            const deviceInfo = data.deviceInfo || {};
            
            html += `
                <div class="activity-item">
                    <div class="activity-icon">
                        <i class="fas fa-sign-in-alt"></i>
                    </div>
                    <div class="activity-details">
                        <h4>Login</h4>
                        <p>${deviceInfo.userAgent || 'Unknown device'}</p>
                        <small>${timeAgo}</small>
                    </div>
                </div>
            `;
        });
        loginHistory.innerHTML = html;
    });
}

// Helper function to format time ago
function getTimeAgo(date) {
    if (!date) return 'Just now';
    
    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = seconds / 31536000;

    if (interval > 1) return Math.floor(interval) + ' years ago';
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' months ago';
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' days ago';
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' hours ago';
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' minutes ago';
    return Math.floor(seconds) + ' seconds ago';
}

// Helper function to show alerts
function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    document.body.appendChild(alertDiv);
    setTimeout(() => alertDiv.remove(), 3000);
}

// Generate QR Code
function generateQR() {
    if (!userData) return;

    const data = qrData.value.trim();
    if (!data) {
        alert('Please enter data for QR code');
        return;
    }

    // Check daily limit
    if (qrCodesGeneratedToday >= userData.plan.dailyLimit) {
        alert('You have reached your daily limit');
        return;
    }

    // Generate QR code
    const qr = new QRCode(qrCodeContainer, {
        text: data,
        width: 200,
        height: 200,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
    });

    // Update stats
    qrCodesGeneratedToday++;
    qrCodesGeneratedTotal++;
    const earnings = userData.plan.rate;
    earningsToday += earnings;
    earningsTotal += earnings;

    // Update database
    const usersRef = collection(db, 'users');
    const userDoc = doc(usersRef, userData.uid);
    updateDoc(userDoc, {
        qrCodesGenerated: increment(1),
        earnings: increment(earnings),
        'wallet.earning': increment(earnings)
    });

    // Add transaction
    const transactionsRef = collection(db, 'transactions');
    addDoc(transactionsRef, {
        userId: userData.uid,
        type: 'qr_generation',
        amount: earnings,
        timestamp: serverTimestamp()
    });

    // Show timer
    let seconds = 2;
    timer.style.display = 'block';
    const timerInterval = setInterval(() => {
        timer.textContent = `Next code in: ${seconds}s`;
        seconds--;
        if (seconds < 0) {
            clearInterval(timerInterval);
            timer.style.display = 'none';
            qrCodeContainer.innerHTML = '';
            qrData.value = '';
        }
    }, 1000);
}

// Remove the duplicate transferFunds function and update the code to use the imported one
async function handleTransfer(fromWallet, toWallet, amount) {
    if (!userData) return;

    if (fromWallet === 'earning' && amount < 50) {
        alert('Minimum transfer amount from earning wallet is ₹50');
        return;
    }

    if (userData.wallet[fromWallet] < amount) {
        alert('Insufficient funds');
        return;
    }

    try {
        await transferFunds(fromWallet, toWallet, amount);
        alert('Transfer successful!');
        // Refresh user data
        await loadUserData();
    } catch (error) {
        console.error('Transfer error:', error);
        alert('Transfer failed: ' + error.message);
    }
}

// Show withdrawal modal
function showWithdrawalModal() {
    withdrawalModal.style.display = 'block';
}

// Close withdrawal modal
function closeWithdrawalModal() {
    withdrawalModal.style.display = 'none';
}

// Handle withdrawal form submission
withdrawalForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const amount = parseFloat(withdrawalForm.withdrawalAmount.value);
    const bankDetails = {
        bankName: withdrawalForm.bankName.value,
        accountNumber: withdrawalForm.accountNumber.value,
        ifscCode: withdrawalForm.ifscCode.value,
        accountHolder: withdrawalForm.accountHolder.value
    };

    if (amount > userData.wallet.main) {
        alert('Insufficient funds in main wallet');
        return;
    }

    // Create withdrawal request
    const withdrawalsRef = collection(db, 'withdrawals');
    addDoc(withdrawalsRef, {
        userId: userData.uid,
        amount: amount,
        bankDetails: bankDetails,
        status: 'pending',
        requestedAt: serverTimestamp()
    });

    // Update wallet balance
    const usersRef = collection(db, 'users');
    const userDoc = doc(usersRef, userData.uid);
    updateDoc(userDoc, {
        'wallet.main': increment(-amount)
    });

    // Add transaction
    const transactionsRef = collection(db, 'transactions');
    addDoc(transactionsRef, {
        userId: userData.uid,
        type: 'withdrawal',
        amount: -amount,
        timestamp: serverTimestamp()
    });

    closeWithdrawalModal();
    withdrawalForm.reset();
});

// Handle profile form submission
profileForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const fullName = profileForm.fullName.value;
    const email = profileForm.email.value;

    const usersRef = collection(db, 'users');
    const userDoc = doc(usersRef, userData.uid);
    updateDoc(userDoc, {
        fullName: fullName,
        email: email
    });

    alert('Profile updated successfully');
});

// Handle password form submission
passwordForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const currentPassword = passwordForm.currentPassword.value;
    const newPassword = passwordForm.newPassword.value;
    const confirmPassword = passwordForm.confirmPassword.value;

    if (newPassword !== confirmPassword) {
        alert('New passwords do not match');
        return;
    }

    const user = auth.currentUser;
    const credential = firebase.auth.EmailAuthProvider.credential(
        user.email,
        currentPassword
    );

    user.reauthenticateWithCredential(credential)
        .then(() => {
            return user.updatePassword(newPassword);
        })
        .then(() => {
            alert('Password updated successfully');
            passwordForm.reset();
        })
        .catch((error) => {
            console.error('Error updating password:', error);
            alert('Error updating password. Please try again.');
        });
});

// Handle profile picture upload
profileUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const storageRef = firebase.storage().ref();
    const profilePicRef = storageRef.child(`profile_pictures/${userData.uid}`);
    
    profilePicRef.put(file)
        .then((snapshot) => {
            return snapshot.ref.getDownloadURL();
        })
        .then((downloadURL) => {
            profilePicture.src = downloadURL;
            const usersRef = collection(db, 'users');
            const userDoc = doc(usersRef, userData.uid);
            updateDoc(userDoc, {
                profilePicture: downloadURL
            });
        })
        .then(() => {
            alert('Profile picture updated successfully');
        })
        .catch((error) => {
            console.error('Error uploading profile picture:', error);
            alert('Error uploading profile picture. Please try again.');
        });
});

// Copy referral link
function copyReferralLink() {
    referralLink.select();
    document.execCommand('copy');
    alert('Referral link copied to clipboard');
}

// Logout
function logout() {
    signOut(auth).then(() => {
        console.log('User signed out successfully');
            window.location.href = 'index.html';
    }).catch((error) => {
            console.error('Error signing out:', error);
        alert('Error signing out: ' + error.message);
        });
} 

// Make logout function available globally
window.logout = logout; 