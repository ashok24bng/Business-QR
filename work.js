// Initialize variables
let currentDataSet = [];
let correctData = null;
let qrCodeCount = parseInt(localStorage.getItem('qrCodeCount') || '0');
const REQUIRED_QR_CODES = 50;
const BATCH_SIZE = 50;

// Initialize statistics
let todayData = 0;
let totalData = 0;
let workedDays = 0;

// Initialize Firebase services
let db;
let auth;

// Define all functions first
function updateQRCountDisplay() {
    // Update the progress circle counter
    const dayNumberElement = document.querySelector('.day-number');
    if (dayNumberElement) {
        dayNumberElement.textContent = qrCodeCount;
    }
    
    // Update the target count
    const targetCountElement = document.querySelector('.target-count');
    if (targetCountElement) {
        targetCountElement.textContent = `/50`;
    }
    
    // Update today's data count
    const todayDataElement = document.querySelector('.stats-list .stat-item:nth-child(1) .stat-value');
    if (todayDataElement) {
        todayDataElement.textContent = qrCodeCount;
    }
    
    // Update total data count
    const totalDataElement = document.querySelector('.stats-list .stat-item:nth-child(2) .stat-value');
    if (totalDataElement) {
        const currentTotal = parseInt(totalDataElement.textContent) || 0;
        totalDataElement.textContent = currentTotal + 1;
    }
    
    // Update submit button state
    const submitButton = document.querySelector('.submit-btn');
    if (submitButton) {
        submitButton.disabled = qrCodeCount < REQUIRED_QR_CODES;
        if (qrCodeCount >= REQUIRED_QR_CODES) {
            submitButton.textContent = 'Submit';
        }
    }
}

function updateSubmitButtonState() {
    const submitButton = document.getElementById('submitButton');
    if (submitButton) {
        submitButton.disabled = qrCodeCount < REQUIRED_QR_CODES;
    }
}

function showCorrectDataHint() {
    if (correctData) {
        const hintElements = {
            companyName: document.getElementById('correctCompanyName'),
            city: document.getElementById('correctCity'),
            country: document.getElementById('correctCountry'),
            zipCode: document.getElementById('correctZipCode'),
            businessId: document.getElementById('correctBusinessId')
        };
        
        for (const [key, element] of Object.entries(hintElements)) {
            if (element) {
                element.textContent = correctData[key];
            }
        }
    }
}

// Clear all form fields
function clearForm() {
    const fields = ['companyName', 'city', 'country', 'zipCode', 'businessId'];
    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        field.value = '';
    });
}

function showQRCodePopup(qrData) {
    const modal = document.getElementById('qrDisplay');
    const qrCodeDiv = document.getElementById('qrCode');
    
    if (modal && qrCodeDiv) {
        qrCodeDiv.innerHTML = '';
        new QRCode(qrCodeDiv, {
            text: JSON.stringify(qrData),
            width: 200,
            height: 200,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });

        modal.style.display = 'flex';
        setTimeout(() => {
            modal.style.display = 'none';
            loadInitialDataSet();
        }, 2000);
    }
}

async function loadCSVData() {
    try {
        console.log('Loading CSV data...');
        const response = await fetch('/cleaned_fake_data_10000.csv');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const csvText = await response.text();
        console.log('CSV text loaded successfully');
        
        const rows = csvText.split('\n').filter(row => row.trim() !== '');
        console.log('Number of rows:', rows.length);
        
        if (rows.length < 2) {
            throw new Error('CSV file is empty or has no data rows');
        }
        
        const dataRows = rows.slice(1);
        console.log('Number of data rows:', dataRows.length);
        
        const data = dataRows.map(row => {
            const values = row.split(',').map(value => value.trim());
            while (values.length < 5) {
                values.push('');
            }
            return {
                companyName: values[0] || '',
                city: values[1] || '',
                country: values[2] || '',
                zipCode: values[3] || '',
                businessId: values[4] || ''
            };
        }).filter(item => item.companyName && item.businessId);
        
        console.log('CSV data loaded:', data.length, 'entries');
        if (data.length === 0) {
            throw new Error('No valid data found in CSV');
        }
        
        return data;
    } catch (error) {
        console.error('Error loading CSV data:', error);
        throw error;
    }
}

function getRandomBatch(data, count) {
    const shuffled = [...data].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

async function loadInitialDataSet() {
    try {
        console.log('Starting loadInitialDataSet...');
        
        console.log('Calling loadCSVData...');
        const allData = await loadCSVData();
        console.log('All data loaded from CSV:', allData.length, 'entries');
        
        const completedIds = JSON.parse(localStorage.getItem('completedIds') || '[]');
        const availableData = allData.filter(item => !completedIds.includes(item.businessId));
        
        if (availableData.length === 0) {
            localStorage.setItem('completedIds', '[]');
            currentDataSet = getRandomBatch(allData, BATCH_SIZE);
        } else {
            currentDataSet = getRandomBatch(availableData, BATCH_SIZE);
        }
        
        localStorage.setItem('currentBatch', JSON.stringify(currentDataSet));
        
        if (currentDataSet.length > 0) {
            correctData = currentDataSet[0];
            showCorrectDataHint();
        }
        
    updateQRCountDisplay();
        
        const formFields = ['companyName', 'city', 'country', 'zipCode', 'businessId'];
        formFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.value = '';
            }
        });
            
        } catch (error) {
        console.error('Error loading data:', error);
        alert('Error loading data: ' + error.message + '\nPlease refresh the page.');
    }
}

// Import Firebase modules
import { 
    auth, 
    db, 
    addQRTransaction
} from './firebase-config.js';
import { 
    doc, 
    getDoc, 
    updateDoc,
    increment,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Make generateQR function globally available
window.generateQR = async function() {
    if (!auth.currentUser) {
        alert('Please login to generate QR codes');
        return;
    }

    try {
        // Get user data
        const userRef = doc(db, 'users', auth.currentUser.uid);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
            throw new Error('User document not found');
        }

        const userData = userDoc.data();
        
        // Check daily limit
        if (userData.stats.todayQRCodes >= userData.plan.dailyLimit) {
            alert('You have reached your daily QR code limit');
            return;
        }

        // Create QR data object
        const qrData = {
            companyName: document.getElementById('companyName').value.trim(),
            city: document.getElementById('city').value.trim(),
            country: document.getElementById('country').value.trim(),
            zipCode: document.getElementById('zipCode').value.trim(),
            businessId: document.getElementById('businessId').value.trim()
        };

        // Clear existing QR code if any
        const qrCodeContainer = document.getElementById('qrCode');
        qrCodeContainer.innerHTML = '';

        // Generate QR code
        const qr = new QRCode(qrCodeContainer, {
            text: JSON.stringify(qrData),
            width: 200,
            height: 200,
            colorDark: '#000000',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.H
        });

        // Show QR code modal
        const qrDisplay = document.getElementById('qrDisplay');
        qrDisplay.style.display = 'flex';

        // Update user stats
        await updateDoc(userRef, {
            'stats.todayQRCodes': increment(1),
            'stats.totalQRCodes': increment(1),
            'wallet.earning': increment(userData.plan.rate)
        });

        // Add transaction
        await addQRTransaction(auth.currentUser.uid, 1);

        // Update local storage
        qrCodeCount++;
        localStorage.setItem('qrCodeCount', qrCodeCount.toString());

        // Update UI
        updateQRCountDisplay();
        updateSubmitButtonState();

        // Start timer for 2 seconds
        let seconds = 2;
        const timer = document.getElementById('timer');
        timer.style.display = 'block';
        timer.textContent = `Next code in: ${seconds}s`;

        const timerInterval = setInterval(() => {
            seconds--;
            timer.textContent = `Next code in: ${seconds}s`;
            
            if (seconds <= 0) {
                clearInterval(timerInterval);
                timer.style.display = 'none';
                qrCodeContainer.innerHTML = '';
                clearForm();
                qrDisplay.style.display = 'none';
                loadInitialDataSet();
            }
        }, 1000);

    } catch (error) {
        console.error('Error generating QR code:', error);
        alert('Error generating QR code. Please try again.');
    }
};

// Initialize Firebase and start the application
auth.onAuthStateChanged((user) => {
    if (user) {
        console.log('User is signed in:', user.uid);
        loadInitialDataSet();
        
        // Set up generateQR button click handler
        const generateQRBtn = document.getElementById('generateQRBtn');
        if (generateQRBtn) {
            generateQRBtn.addEventListener('click', generateQR);
        }
    } else {
        console.log('User is signed out');
        window.location.href = 'index.html';
    }
});

// Make functions globally available
window.openWhatsApp = function(planType) {
    const phoneNumber = "919876543210"; // Replace with your WhatsApp number
    const message = `I want to upgrade to the ${planType} Plan`;
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

window.showPlanUpgradeModal = function() {
    const modal = document.getElementById('planUpgradeModal');
    if (modal) {
        modal.style.display = 'flex';
        modal.style.justifyContent = 'center';
        modal.style.alignItems = 'center';
    }
}

// Close modal when clicking outside
document.addEventListener('click', function(event) {
    const modal = document.getElementById('planUpgradeModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

// Initialize plan modal functionality
function initializePlanModal() {
    // Get the upgrade button
    const upgradeBtn = document.querySelector('.upgrade-btn');
    if (upgradeBtn) {
        upgradeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const modal = document.getElementById('planUpgradeModal');
            if (modal) {
                modal.style.display = 'flex';
                modal.style.justifyContent = 'center';
                modal.style.alignItems = 'center';
            }
        });
    }

    // Close modal when clicking outside
    const modal = document.getElementById('planUpgradeModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    // Handle WhatsApp upgrade buttons
    const upgradeButtons = document.querySelectorAll('.upgrade-plan-btn');
    upgradeButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const planType = this.getAttribute('data-plan');
            const phoneNumber = "919876543210"; // Replace with your WhatsApp number
            const message = `I want to upgrade to the ${planType} Plan`;
            const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
        });
    });
}

// Call initializePlanModal when the DOM is loaded
document.addEventListener('DOMContentLoaded', initializePlanModal); 