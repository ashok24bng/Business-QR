// Import Firebase authentication functions
import { auth, signInWithEmailAndPassword } from './firebase-config.js';

// DOM Elements
const loginForm = document.getElementById('loginForm');
const errorModal = document.getElementById('errorModal');
const errorMessage = document.getElementById('errorMessage');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const submitButton = loginForm.querySelector('button[type="submit"]');

// Error messages mapping
const errorMessages = {
    'auth/invalid-email': 'Invalid email address format.',
    'auth/user-disabled': 'This account has been disabled.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later or reset your password.',
    'auth/network-request-failed': 'Network error. Please check your internet connection.',
    'auth/invalid-credential': 'Invalid login credentials.',
    'default': 'An unexpected error occurred. Please try again.'
};

/**
 * Displays error modal with specific message
 * @param {string} message - Error message to display
 */
function showErrorModal(message) {
    errorMessage.textContent = message;
    errorModal.classList.remove('hidden');
    errorModal.classList.add('flex');
}

/**
 * Hides the error modal
 */
function closeErrorModal() {
    errorModal.classList.remove('flex');
    errorModal.classList.add('hidden');
}

/**
 * Sets the submit button to loading state
 */
function setLoadingState() {
    submitButton.innerHTML = '<span class="spinner"></span> Logging in...';
    submitButton.disabled = true;
}

/**
 * Resets the submit button to default state
 */
function resetButtonState() {
    submitButton.innerHTML = 'Login';
    submitButton.disabled = false;
}

/**
 * Handles the login form submission
 * @param {Event} e - Form submit event
 */
async function handleLogin(e) {
    e.preventDefault();
    
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    
    // Basic client-side validation
    if (!email || !password) {
        showErrorModal('Please fill in all fields');
        return;
    }

    try {
        setLoadingState();
        
        // Authenticate user
        await signInWithEmailAndPassword(auth, email, password);
        
        // Redirect to dashboard on success
        window.location.href = 'dashboard.html';
    } catch (error) {
        console.error('Login error:', error);
        const message = errorMessages[error.code] || errorMessages['default'];
        showErrorModal(message);
        resetButtonState();
        
        // Clear password field on error
        passwordInput.value = '';
        passwordInput.focus();
    }
}

// Event Listeners
loginForm.addEventListener('submit', handleLogin);
window.closeErrorModal = closeErrorModal; // Make available globally

// Check auth state on page load
auth.onAuthStateChanged((user) => {
    if (user) {
        console.log('User already authenticated:', user.uid);
        window.location.href = 'dashboard.html';
    }
});

// Add keyboard event for closing modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && errorModal.classList.contains('flex')) {
        closeErrorModal();
    }
});