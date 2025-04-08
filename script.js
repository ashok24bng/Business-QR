// Import Firebase modules
import { 
    auth, 
    db, 
    registerUser, 
    loginUser,
    transferFunds
} from './firebase-config.js';
import { 
    collection, 
    doc, 
    setDoc, 
    getDoc, 
    serverTimestamp,
    updateDoc,
    increment
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { 
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Mobile Menu Functionality
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menuToggle');
    const mobileNav = document.getElementById('mobileNav');
    const mobileLoginBtn = document.getElementById('mobileLoginBtn');
    
    if (menuToggle && mobileNav) {
        menuToggle.addEventListener('click', function() {
            mobileNav.classList.toggle('active');
            document.body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : '';
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!mobileNav.contains(event.target) && !menuToggle.contains(event.target)) {
                mobileNav.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
    
    if (mobileLoginBtn) {
        mobileLoginBtn.addEventListener('click', function() {
            showLoginModal();
            mobileNav.classList.remove('active');
            document.body.style.overflow = '';
        });
    }
});

// Make modal functions available globally
window.showLoginModal = function() {
    const loginModal = document.getElementById('loginModal');
    if (loginModal) {
        loginModal.style.display = 'flex';
        console.log('Showing login modal');
    } else {
        console.error('Login modal not found');
    }
};

window.closeLoginModal = function() {
    const loginModal = document.getElementById('loginModal');
    if (loginModal) {
        loginModal.style.display = 'none';
        console.log('Closing login modal');
    }
};

window.showRegisterModal = function() {
    const registerModal = document.getElementById('registerModal');
    if (registerModal) {
        registerModal.style.display = 'flex';
        console.log('Showing register modal');
    } else {
        console.error('Register modal not found');
    }
};

window.closeRegisterModal = function() {
    const registerModal = document.getElementById('registerModal');
    if (registerModal) {
        registerModal.style.display = 'none';
        console.log('Closing register modal');
    }
};

// Password visibility toggle function
window.togglePasswordVisibility = function(inputId) {
    const input = document.getElementById(inputId);
    const icon = event.currentTarget.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
};

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded');

    // Get DOM elements
    const loginBtn = document.getElementById('loginBtn');
    const registerModal = document.getElementById('registerModal');
    const closeRegisterBtn = document.getElementById('closeRegisterBtn');
    const registerForm = document.getElementById('registerForm');
    const switchToRegisterBtn = document.getElementById('switchToRegister');
    const switchToLoginBtn = document.getElementById('switchToLogin');

    // Debug log for elements
    console.log('Elements found:', {
        loginBtn: !!loginBtn,
        registerModal: !!registerModal,
        closeRegisterBtn: !!closeRegisterBtn,
        registerForm: !!registerForm,
        switchToRegisterBtn: !!switchToRegisterBtn,
        switchToLoginBtn: !!switchToLoginBtn
    });

    // Login button click - redirect to login page
    if (loginBtn) {
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Login button clicked');
            window.location.href = 'login.html';
        });
    }

    // Close buttons
    if (closeRegisterBtn) {
        closeRegisterBtn.addEventListener('click', () => {
            console.log('Close register button clicked');
            closeRegisterModal();
        });
    }

    // Switch between modals
    if (switchToRegisterBtn) {
        switchToRegisterBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Switch to register clicked');
            closeLoginModal();
            showRegisterModal();
        });
    }

    if (switchToLoginBtn) {
        switchToLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Switch to login clicked');
            closeRegisterModal();
            showLoginModal();
        });
    }

    // Close modals when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target === loginModal) {
            console.log('Clicked outside login modal');
            closeLoginModal();
        }
        if (event.target === registerModal) {
            console.log('Clicked outside register modal');
            closeRegisterModal();
        }
    });

    // Login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            try {
                console.log('Attempting login with email:', email);
                const user = await loginUser(email, password);
                console.log('Login successful:', user);

                // Close login modal and reset form
                closeLoginModal();
                loginForm.reset();
                
                // Redirect to dashboard
                window.location.href = 'dashboard.html';
            } catch (error) {
                console.error('Login error:', error);
                let errorMessage = 'Login failed. Please try again.';
                
                // Handle specific error cases
                if (error.code === 'auth/invalid-email') {
                    errorMessage = 'Invalid email address.';
                } else if (error.code === 'auth/user-disabled') {
                    errorMessage = 'This account has been disabled.';
                } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                    errorMessage = 'Invalid email or password.';
                } else if (error.code === 'auth/too-many-requests') {
                    errorMessage = 'Too many failed attempts. Please try again later.';
                } else if (error.code === 'permission-denied') {
                    errorMessage = 'Access denied. Please contact support.';
                }
                
                alert(errorMessage);
            }
        });
    }

    // Registration form submission
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const fullName = document.getElementById('registerName').value;
            const phoneNumber = document.getElementById('registerPhone').value;
            const city = document.getElementById('registerCity').value;
            const referralCode = document.getElementById('registerReferral').value;

            try {
                console.log('Attempting registration with email:', email);
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                console.log('Registration successful:', userCredential.user.email);

                // Create user document in Firestore
                const userRef = doc(db, 'users', userCredential.user.uid);
                await setDoc(userRef, {
                    email: email,
                    fullName: fullName,
                    phoneNumber: phoneNumber,
                    city: city,
                    createdAt: serverTimestamp(),
                    lastLogin: serverTimestamp(),
                    plan: {
                        name: 'Free Plan',
                        dailyLimit: 50,
                        rate: 5
                    },
                    wallet: {
                        earning: 0,
                        bonus: 0,
                        main: 0
                    },
                    stats: {
                        totalQRCodes: 0,
                        totalEarnings: 0,
                        totalReferrals: 0
                    },
                    referralCode: generateReferralCode(),
                    referredBy: referralCode || null
                });

                // Close registration modal and reset form
                closeRegisterModal();
                registerForm.reset();
                
                // Show success message
                Swal.fire({
                    icon: 'success',
                    title: 'Registration Successful!',
                    text: 'You can now login to your account.',
                    showConfirmButton: true
                }).then((result) => {
                    if (result.isConfirmed) {
                        // Close register modal and open login modal
                        document.getElementById('registerModal').style.display = 'none';
                        document.getElementById('loginModal').style.display = 'block';
                    }
                });
            } catch (error) {
                console.error('Registration error:', error);
                let errorMessage = 'An error occurred during registration.';
                
                switch (error.code) {
                    case 'auth/email-already-in-use':
                        errorMessage = 'This email is already registered. Please login or use a different email.';
                        break;
                    case 'auth/invalid-email':
                        errorMessage = 'Invalid email address. Please check and try again.';
                        break;
                    case 'auth/weak-password':
                        errorMessage = 'Password is too weak. Please use at least 6 characters.';
                        break;
                    default:
                        errorMessage = error.message;
                }

                Swal.fire({
                    icon: 'error',
                    title: 'Registration Failed',
                    text: errorMessage
                });
            }
        });
    }

// Check authentication state
    onAuthStateChanged(auth, (user) => {
    if (user) {
            console.log('User is signed in:', user.email);
            // Update UI for logged in user
            if (loginBtn) {
                loginBtn.textContent = 'Dashboard';
                loginBtn.onclick = () => {
                    window.location.href = 'dashboard.html';
                };
            }
        } else {
            console.log('User is signed out');
            // Update UI for signed out user
        if (loginBtn) {
                loginBtn.textContent = 'Login';
                loginBtn.onclick = (e) => {
                    e.preventDefault();
                    window.location.href = 'login.html';
                };
            }
        }
    });
});

// Transfer funds between wallets
async function transferFunds(fromWallet, toWallet, amount) {
    try {
        const user = auth.currentUser;
        if (!user) {
            throw new Error('User not authenticated');
        }

        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
            throw new Error('User document not found');
        }

        const userData = userDoc.data();
        const currentBalance = userData.wallet[fromWallet] || 0;

        if (currentBalance < amount) {
            throw new Error(`Insufficient balance in ${fromWallet} wallet`);
        }

        // Update wallet balances
        await updateDoc(userRef, {
            [`wallet.${fromWallet}`]: increment(-amount),
            [`wallet.${toWallet}`]: increment(amount)
        });

        // Add transaction record
        const transactionRef = doc(collection(db, 'transactions'));
        await setDoc(transactionRef, {
            userId: user.uid,
            type: 'transfer',
            fromWallet: fromWallet,
            toWallet: toWallet,
            amount: amount,
            timestamp: serverTimestamp()
        });

        return true;
    } catch (error) {
        console.error('Transfer error:', error);
        throw error;
    }
} 