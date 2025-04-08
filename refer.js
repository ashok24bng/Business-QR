// Check authentication state
auth.onAuthStateChanged((user) => {
    if (!user) {
        window.location.href = 'index.html';
        return;
    }
    loadReferralData(user.uid);
    loadReferralHistory(user.uid);
});

// Load referral data
async function loadReferralData(userId) {
    try {
        const userDoc = await db.collection('users').doc(userId).get();
        const userData = userDoc.data();

        if (userData) {
            document.getElementById('referralCode').textContent = userData.referralCode || 'N/A';
            
            // Get referral stats
            const referralsSnapshot = await db.collection('referrals')
                .where('referrerId', '==', userId)
                .get();
                
            const totalReferrals = referralsSnapshot.size;
            let totalEarnings = 0;
            
            referralsSnapshot.forEach(doc => {
                const referral = doc.data();
                if (referral.status === 'completed') {
                    totalEarnings += 50; // ₹50 per successful referral
                }
            });
            
            document.getElementById('totalReferrals').textContent = totalReferrals;
            document.getElementById('totalEarnings').textContent = `₹${totalEarnings}`;
        }
    } catch (error) {
        console.error('Error loading referral data:', error);
        alert('Failed to load referral data. Please try again.');
    }
}

// Load referral history
async function loadReferralHistory(userId) {
    try {
        const historyList = document.getElementById('referralHistory');
        historyList.innerHTML = '';

        const referralsSnapshot = await db.collection('referrals')
            .where('referrerId', '==', userId)
            .orderBy('timestamp', 'desc')
            .get();

        if (referralsSnapshot.empty) {
            historyList.innerHTML = `
                <div class="no-history">
                    <p>No referrals yet. Share your code to start earning!</p>
                </div>
            `;
            return;
        }

        referralsSnapshot.forEach(doc => {
            const referral = doc.data();
            const historyItem = createHistoryItem(referral);
            historyList.appendChild(historyItem);
        });
    } catch (error) {
        console.error('Error loading referral history:', error);
        alert('Failed to load referral history. Please try again.');
    }
}

// Create history item element
function createHistoryItem(referral) {
    const div = document.createElement('div');
    div.className = 'history-item';
    
    div.innerHTML = `
        <div class="history-info">
            <div class="history-details">
                <h4>${referral.referredEmail}</h4>
                <p>${new Date(referral.timestamp.toDate()).toLocaleString()}</p>
            </div>
        </div>
        <div class="history-status ${referral.status === 'completed' ? 'status-completed' : 'status-pending'}">
            ${referral.status === 'completed' ? 'Completed' : 'Pending'}
        </div>
    `;
    
    return div;
}

// Copy referral code
function copyReferralCode() {
    const referralCode = document.getElementById('referralCode').textContent;
    navigator.clipboard.writeText(referralCode)
        .then(() => {
            alert('Referral code copied to clipboard!');
        })
        .catch(err => {
            console.error('Failed to copy text:', err);
            alert('Failed to copy referral code. Please try again.');
        });
}

// Share on WhatsApp
function shareOnWhatsApp() {
    const referralCode = document.getElementById('referralCode').textContent;
    const message = encodeURIComponent(
        `Join QR Card using my referral code: ${referralCode}\n` +
        `Get ₹50 bonus when you subscribe to any plan!\n` +
        `Sign up now: ${window.location.origin}`
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
}

// Share on Telegram
function shareOnTelegram() {
    const referralCode = document.getElementById('referralCode').textContent;
    const message = encodeURIComponent(
        `Join QR Card using my referral code: ${referralCode}\n` +
        `Get ₹50 bonus when you subscribe to any plan!\n` +
        `Sign up now: ${window.location.origin}`
    );
    window.open(`https://t.me/share/url?url=${window.location.origin}&text=${message}`, '_blank');
} 