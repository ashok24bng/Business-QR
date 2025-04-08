// DOM Elements
const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');

// Modal Functions
function showLoginModal() {
    loginModal.style.display = 'block';
    registerModal.style.display = 'none';
}

function closeLoginModal() {
    loginModal.style.display = 'none';
}

function showRegisterModal() {
    registerModal.style.display = 'block';
    loginModal.style.display = 'none';
}

function closeRegisterModal() {
    registerModal.style.display = 'none';
}

// Close modals when clicking outside
window.onclick = function(event) {
    if (event.target === loginModal) {
        closeLoginModal();
    }
    if (event.target === registerModal) {
        closeRegisterModal();
    }
}

// Check authentication state
auth.onAuthStateChanged((user) => {
    if (user) {
        // User is signed in
        console.log('User is signed in:', user);
        // Update UI for logged in user
        document.querySelector('.btn-login').textContent = 'Dashboard';
        document.querySelector('.btn-login').onclick = () => {
            window.location.href = 'dashboard.html';
        };
    } else {
        // User is signed out
        console.log('User is signed out');
        // Update UI for signed out user
        document.querySelector('.btn-login').textContent = 'Login';
        document.querySelector('.btn-login').onclick = showLoginModal;
    }
});

// QR Code Generation
function generateQRCode(data) {
    // This function will be implemented in the work page
    // It will use the qrcode.react library
    return new Promise((resolve) => {
        // Simulate QR code generation
        setTimeout(() => {
            resolve({
                code: 'QR_CODE_DATA',
                timestamp: new Date()
            });
        }, 1000);
    });
}

// Plan Purchase
function purchasePlan(planId) {
    const plans = {
        'free': { price: 0, dailyLimit: 250, rate: 5 },
        'premium': { price: 1999, dailyLimit: 1000, rate: 10 },
        'pro': { price: 4999, dailyLimit: 1500, rate: 15 },
        'enterprise': { price: 9999, dailyLimit: 3000, rate: 20 }
    };

    const plan = plans[planId];
    if (!plan) return;

    const user = auth.currentUser;
    if (!user) {
        showLoginModal();
        return;
    }

    // Update user's plan in Firestore
    db.collection('users').doc(user.uid).update({
        plan: planId,
        planPurchasedAt: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        alert(`Successfully upgraded to ${planId} plan!`);
    })
    .catch((error) => {
        console.error('Error updating plan:', error);
        alert('Error updating plan. Please try again.');
    });
}

// Wallet Management
function transferFunds(fromWallet, toWallet, amount) {
    const user = auth.currentUser;
    if (!user) return;

    db.collection('users').doc(user.uid).get()
        .then((doc) => {
            const data = doc.data();
            if (data.wallet[fromWallet] < amount) {
                alert('Insufficient funds');
                return;
            }

            const updates = {
                [`wallet.${fromWallet}`]: firebase.firestore.FieldValue.increment(-amount),
                [`wallet.${toWallet}`]: firebase.firestore.FieldValue.increment(amount)
            };

            return db.collection('users').doc(user.uid).update(updates);
        })
        .then(() => {
            alert('Transfer successful!');
        })
        .catch((error) => {
            console.error('Error transferring funds:', error);
            alert('Error transferring funds. Please try again.');
        });
}

// Withdrawal Request
function requestWithdrawal(amount, bankDetails) {
    const user = auth.currentUser;
    if (!user) return;

    db.collection('withdrawals').add({
        userId: user.uid,
        amount: amount,
        bankDetails: bankDetails,
        status: 'pending',
        requestedAt: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        alert('Withdrawal request submitted successfully!');
    })
    .catch((error) => {
        console.error('Error submitting withdrawal request:', error);
        alert('Error submitting withdrawal request. Please try again.');
    });
}

// Event Listeners for Plan Buttons
document.querySelectorAll('.btn-plan').forEach(button => {
    button.addEventListener('click', (e) => {
        const planId = e.target.closest('.plan-card').querySelector('h3').textContent.toLowerCase().replace(' plan', '');
        purchasePlan(planId);
    });
});

// Mobile Menu
function toggleMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    navLinks.classList.toggle('active');
}

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    const navLinks = document.querySelector('.nav-links');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    if (!navLinks.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
        navLinks.classList.remove('active');
    }
});

// Add to Home Screen Prompt
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const addToHome = document.querySelector('.add-to-home');
    addToHome.style.display = 'block';
});

document.querySelector('.add-to-home button').addEventListener('click', async () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
        }
        deferredPrompt = null;
        document.querySelector('.add-to-home').style.display = 'none';
    }
}); 