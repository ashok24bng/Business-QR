// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Initialize Firebase with your config
const firebaseConfig = {
    apiKey: "AIzaSyBhUSWi8CfYzuKjTI_Ep_h6BkQT51GEjjw",
    authDomain: "business-qr-51b78.firebaseapp.com",
    projectId: "business-qr-51b78",
    storageBucket: "business-qr-51b78.firebasestorage.app",
    messagingSenderId: "484306511086",
    appId: "1:484306511086:web:2b721ce83d72220dc8bfff",
    measurementId: "G-RKCQV6ER06"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Registration Function
async function registerUser(event) {
    event.preventDefault();
    
    console.log('Registration function called');
    
    const fullName = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    const phone = document.getElementById('registerPhone').value;
    const city = document.getElementById('registerCity').value;
    const referralCode = document.getElementById('registerReferral').value;

    console.log('Form data collected:', { email, fullName, phone, city });

    // Validate passwords match
    if (password !== confirmPassword) {
        Swal.fire({
            icon: 'error',
            title: 'Password Mismatch',
            text: 'Passwords do not match. Please try again.',
        });
        return;
    }

    try {
        console.log('Starting registration process...');
        
        // Create user with email and password
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log('User created successfully:', user.uid);

        // Store additional user data in Firestore
        const userRef = doc(db, "users", user.uid);
        const userData = {
            fullName: fullName,
            email: email,
            phone: phone,
            city: city,
            referralCode: referralCode || null,
            registeredOn: new Date(),
            balance: 0,
            totalEarnings: 0,
            qrCodesGenerated: 0,
            totalScans: 0,
            plan: {
                name: 'Free Trial',
                dailyLimit: 50,
                rate: 5
            },
            wallet: {
                earning: 0,
                bonus: 0,
                main: 0
            }
        };

        console.log('Storing user data in Firestore:', userData);
        await setDoc(userRef, userData);
        console.log('User data stored in Firestore successfully');

        // Show success message
        Swal.fire({
            icon: 'success',
            title: 'Registration Successful!',
            text: 'Redirecting to dashboard...',
            timer: 1500,
            showConfirmButton: false
        }).then(() => {
            window.location.href = 'dashboard.html';
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
}

// Login Function
async function loginUser(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        
        // Show success message and redirect
        Swal.fire({
            icon: 'success',
            title: 'Login Successful!',
            text: 'Redirecting to dashboard...',
            timer: 1500,
            showConfirmButton: false
        }).then(() => {
            window.location.href = 'dashboard.html';
        });

    } catch (error) {
        let errorMessage = 'An error occurred during login.';
        
        switch (error.code) {
            case 'auth/user-not-found':
                errorMessage = 'No account found with this email. Please register first.';
                break;
            case 'auth/wrong-password':
                errorMessage = 'Incorrect password. Please try again.';
                break;
            case 'auth/invalid-email':
                errorMessage = 'Invalid email address. Please check and try again.';
                break;
            default:
                errorMessage = error.message;
        }

        Swal.fire({
            icon: 'error',
            title: 'Login Failed',
            text: errorMessage
        });
    }
}

// Initialize event listeners when DOM is loaded
function initializeEventListeners() {
    console.log('Initializing event listeners...');

    // Get elements
    const loginBtn = document.getElementById('loginBtn');
    const startEarningBtn = document.getElementById('startEarningBtn');
    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');
    const switchToRegisterBtn = document.getElementById('switchToRegister');
    const switchToLoginBtn = document.getElementById('switchToLogin');
    const closeButtons = document.querySelectorAll('.close');
    const modals = document.querySelectorAll('.modal');

    // Login button click handler
    if (loginBtn) {
        console.log('Adding login button handler');
        loginBtn.addEventListener('click', () => {
            document.getElementById('loginModal').style.display = 'block';
        });
    }

    // Start earning button click handler
    if (startEarningBtn) {
        console.log('Adding start earning button handler');
        startEarningBtn.addEventListener('click', () => {
            document.getElementById('registerModal').style.display = 'block';
        });
    }

    // Form submit handlers
    if (registerForm) {
        console.log('Adding register form handler');
        registerForm.addEventListener('submit', registerUser);
    }

    if (loginForm) {
        console.log('Adding login form handler');
        loginForm.addEventListener('submit', loginUser);
    }

    // Modal switch handlers
    if (switchToRegisterBtn) {
        console.log('Adding switch to register handler');
        switchToRegisterBtn.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('loginModal').style.display = 'none';
            document.getElementById('registerModal').style.display = 'block';
        });
    }

    if (switchToLoginBtn) {
        console.log('Adding switch to login handler');
        switchToLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('registerModal').style.display = 'none';
            document.getElementById('loginModal').style.display = 'block';
        });
    }

    // Close button handlers
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            modals.forEach(modal => {
                modal.style.display = 'none';
            });
        });
    });

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });

    // Check if user is already logged in
    auth.onAuthStateChanged((user) => {
        if (user && window.location.pathname.includes('index.html')) {
            window.location.href = 'dashboard.html';
        }
    });
}

// Initialize event listeners when the DOM is loaded
document.addEventListener('DOMContentLoaded', initializeEventListeners);

// Export functions
export { registerUser, loginUser }; 