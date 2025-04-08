// Check authentication state
auth.onAuthStateChanged((user) => {
    if (!user) {
        window.location.href = 'index.html';
        return;
    }
    loadWalletData(user.uid);
    loadRecentActivity(user.uid);
});

// Load wallet data
async function loadWalletData(userId) {
    try {
        const userDoc = await db.collection('users').doc(userId).get();
        const userData = userDoc.data();

        if (userData) {
            document.getElementById('earningBalance').textContent = `₹${userData.earningWallet || 0}`;
            document.getElementById('bonusBalance').textContent = `₹${userData.bonusWallet || 0}`;
            document.getElementById('mainBalance').textContent = `₹${userData.mainWallet || 0}`;
        }
    } catch (error) {
        console.error('Error loading wallet data:', error);
        alert('Failed to load wallet data. Please try again.');
    }
}

// Load recent activity
async function loadRecentActivity(userId) {
    try {
        const activityList = document.getElementById('activityList');
        activityList.innerHTML = ''; // Clear existing items

        const activities = await db.collection('transactions')
            .where('userId', '==', userId)
            .orderBy('timestamp', 'desc')
            .limit(10)
            .get();

        activities.forEach(doc => {
            const activity = doc.data();
            const activityItem = createActivityItem(activity);
            activityList.appendChild(activityItem);
        });
    } catch (error) {
        console.error('Error loading activity:', error);
        alert('Failed to load recent activity. Please try again.');
    }
}

// Create activity item element
function createActivityItem(activity) {
    const div = document.createElement('div');
    div.className = 'activity-item';
    
    const iconClass = activity.type === 'credit' ? 'fa-arrow-down' : 'fa-arrow-up';
    const amountClass = activity.type === 'credit' ? 'credit' : 'debit';
    
    div.innerHTML = `
        <div class="activity-info">
            <div class="activity-icon">
                <i class="fas ${iconClass}"></i>
            </div>
            <div class="activity-details">
                <h4>${activity.description}</h4>
                <small>${new Date(activity.timestamp.toDate()).toLocaleString()}</small>
            </div>
        </div>
        <div class="activity-amount ${amountClass}">
            ${activity.type === 'credit' ? '+' : '-'}₹${activity.amount}
        </div>
    `;
    
    return div;
}

// Handle transfer between wallets
async function handleTransfer(fromWallet, toWallet) {
    const amount = parseFloat(prompt(`Enter amount to transfer from ${fromWallet} to ${toWallet}:`));
    
    if (!amount || isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount.');
        return;
    }

    try {
        const userId = auth.currentUser.uid;
        const userRef = db.collection('users').doc(userId);
        
        const userDoc = await userRef.get();
        const userData = userDoc.data();
        
        const fromBalance = userData[fromWallet] || 0;
        
        if (fromBalance < amount) {
            alert('Insufficient balance for transfer.');
            return;
        }
        
        await db.runTransaction(async (transaction) => {
            transaction.update(userRef, {
                [fromWallet]: firebase.firestore.FieldValue.increment(-amount),
                [toWallet]: firebase.firestore.FieldValue.increment(amount)
            });
            
            // Add transaction record
            const transactionRef = db.collection('transactions').doc();
            transaction.set(transactionRef, {
                userId,
                type: 'transfer',
                amount,
                fromWallet,
                toWallet,
                description: `Transfer from ${fromWallet} to ${toWallet}`,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
        });
        
        alert('Transfer successful!');
        loadWalletData(userId);
        loadRecentActivity(userId);
    } catch (error) {
        console.error('Error during transfer:', error);
        alert('Transfer failed. Please try again.');
    }
}

// Handle withdrawal request
async function handleWithdrawal() {
    const modal = document.getElementById('withdrawModal');
    const form = document.getElementById('withdrawForm');
    
    modal.style.display = 'block';
    
    // Close modal when clicking outside
    modal.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
    
    // Close button functionality
    document.querySelector('.close').onclick = () => {
        modal.style.display = 'none';
    };
    
    form.onsubmit = async (e) => {
        e.preventDefault();
        
        const amount = parseFloat(document.getElementById('withdrawAmount').value);
        const bankName = document.getElementById('bankName').value;
        const accountNumber = document.getElementById('accountNumber').value;
        const ifscCode = document.getElementById('ifscCode').value;
        const accountHolder = document.getElementById('accountHolder').value;
        
        if (!amount || !bankName || !accountNumber || !ifscCode || !accountHolder) {
            alert('Please fill all fields.');
            return;
        }
        
        try {
            const userId = auth.currentUser.uid;
            const userRef = db.collection('users').doc(userId);
            
            const userDoc = await userRef.get();
            const userData = userDoc.data();
            
            if ((userData.mainWallet || 0) < amount) {
                alert('Insufficient balance for withdrawal.');
                return;
            }
            
            await db.runTransaction(async (transaction) => {
                transaction.update(userRef, {
                    mainWallet: firebase.firestore.FieldValue.increment(-amount)
                });
                
                const withdrawalRef = db.collection('withdrawals').doc();
                transaction.set(withdrawalRef, {
                    userId,
                    amount,
                    bankName,
                    accountNumber,
                    ifscCode,
                    accountHolder,
                    status: 'pending',
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                });
                
                const transactionRef = db.collection('transactions').doc();
                transaction.set(transactionRef, {
                    userId,
                    type: 'debit',
                    amount,
                    description: 'Withdrawal Request',
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                });
            });
            
            alert('Withdrawal request submitted successfully!');
            modal.style.display = 'none';
            form.reset();
            loadWalletData(userId);
            loadRecentActivity(userId);
        } catch (error) {
            console.error('Error during withdrawal:', error);
            alert('Withdrawal request failed. Please try again.');
        }
    };
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Transfer button listeners
    document.getElementById('transferEarningToMain').onclick = () => handleTransfer('earningWallet', 'mainWallet');
    document.getElementById('transferBonusToMain').onclick = () => handleTransfer('bonusWallet', 'mainWallet');
    
    // Withdraw button listener
    document.getElementById('withdrawButton').onclick = handleWithdrawal;
}); 