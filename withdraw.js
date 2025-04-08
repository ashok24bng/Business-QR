import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { doc, getDoc, updateDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

// Check authentication state
onAuthStateChanged(window.auth, async (user) => {
    if (user) {
        console.log('User is signed in:', user.email);
        try {
            // Get user data
            const userDoc = await getDoc(doc(window.db, 'users', user.uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                console.log('User data:', userData);
                updateWithdrawUI(userData);
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

// Update withdraw UI
function updateWithdrawUI(userData) {
    // Update user info
    document.getElementById('userName').textContent = userData.name || 'User';
    document.getElementById('userEmail').textContent = userData.email;
    document.getElementById('userBalance').textContent = userData.balance || '0';
    document.getElementById('userReferralCode').textContent = userData.referralCode || 'N/A';
    document.getElementById('userReferralCount').textContent = userData.referralCount || '0';
    document.getElementById('userQRCount').textContent = userData.qrCount || '0';
    document.getElementById('userTransactionCount').textContent = userData.transactionCount || '0';
}

// Withdraw form submission
document.getElementById('withdrawForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = window.auth.currentUser;
    if (!user) {
        console.error('No user is signed in');
        return;
    }

    const amount = document.getElementById('amount').value;
    const bankName = document.getElementById('bankName').value;
    const accountNumber = document.getElementById('accountNumber').value;
    const ifscCode = document.getElementById('ifscCode').value;

    try {
        // Get user data
        const userDoc = await getDoc(doc(window.db, 'users', user.uid));
        if (!userDoc.exists()) {
            console.error('No user data found');
            return;
        }

        const userData = userDoc.data();
        if (userData.balance < amount) {
            alert('Insufficient balance');
            return;
        }

        // Update user balance
        await updateDoc(doc(window.db, 'users', user.uid), {
            balance: userData.balance - amount,
            updatedAt: serverTimestamp()
        });

        // Add withdrawal record
        await updateDoc(doc(window.db, 'withdrawals', user.uid), {
            amount,
            bankName,
            accountNumber,
            ifscCode,
            status: 'pending',
            createdAt: serverTimestamp()
        });

        console.log('Withdrawal request submitted successfully');
        alert('Withdrawal request submitted successfully');
    } catch (error) {
        console.error('Error submitting withdrawal request:', error);
        alert('Error submitting withdrawal request: ' + error.message);
    }
}); 