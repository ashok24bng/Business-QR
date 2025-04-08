// Check authentication state
auth.onAuthStateChanged((user) => {
    if (!user) {
        window.location.href = 'index.html';
        return;
    }
    initializePage();
});

let lastDoc = null;
let isLoading = false;

// Initialize page
function initializePage() {
    // Set default date range (last 30 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    document.getElementById('startDate').value = startDate.toISOString().split('T')[0];
    document.getElementById('endDate').value = endDate.toISOString().split('T')[0];
    
    loadTransactions();
}

// Load transactions
async function loadTransactions(isLoadMore = false) {
    if (isLoading) return;
    isLoading = true;
    
    try {
        const userId = auth.currentUser.uid;
        const typeFilter = document.getElementById('typeFilter').value;
        const startDate = new Date(document.getElementById('startDate').value);
        const endDate = new Date(document.getElementById('endDate').value);
        endDate.setHours(23, 59, 59, 999);
        
        let query = db.collection('transactions')
            .where('userId', '==', userId)
            .where('timestamp', '>=', startDate)
            .where('timestamp', '<=', endDate)
            .orderBy('timestamp', 'desc')
            .limit(10);
            
        if (typeFilter !== 'all') {
            query = query.where('type', '==', typeFilter);
        }
        
        if (isLoadMore && lastDoc) {
            query = query.startAfter(lastDoc);
        } else {
            document.getElementById('transactionsList').innerHTML = '';
        }
        
        const snapshot = await query.get();
        
        if (snapshot.empty && !isLoadMore) {
            document.getElementById('transactionsList').innerHTML = `
                <div class="no-transactions">
                    <i class="fas fa-receipt"></i>
                    <p>No transactions found</p>
                </div>
            `;
            document.getElementById('loadMoreBtn').style.display = 'none';
            return;
        }
        
        snapshot.forEach(doc => {
            const transaction = doc.data();
            const transactionElement = createTransactionElement(transaction);
            document.getElementById('transactionsList').appendChild(transactionElement);
        });
        
        lastDoc = snapshot.docs[snapshot.docs.length - 1];
        document.getElementById('loadMoreBtn').style.display = snapshot.size < 10 ? 'none' : 'block';
        
    } catch (error) {
        console.error('Error loading transactions:', error);
        alert('Failed to load transactions. Please try again.');
    } finally {
        isLoading = false;
    }
}

// Create transaction element
function createTransactionElement(transaction) {
    const div = document.createElement('div');
    div.className = `transaction-item ${transaction.type}`;
    
    let iconClass = '';
    switch (transaction.type) {
        case 'credit':
            iconClass = 'fa-arrow-down';
            break;
        case 'debit':
            iconClass = 'fa-arrow-up';
            break;
        case 'transfer':
            iconClass = 'fa-exchange-alt';
            break;
    }
    
    div.innerHTML = `
        <div class="transaction-info">
            <div class="transaction-icon">
                <i class="fas ${iconClass}"></i>
            </div>
            <div class="transaction-details">
                <h3>${transaction.description}</h3>
                <p>${new Date(transaction.timestamp.toDate()).toLocaleString()}</p>
            </div>
        </div>
        <div class="transaction-amount">
            ${transaction.type === 'credit' ? '+' : '-'}₹${transaction.amount}
        </div>
    `;
    
    return div;
}

// Apply filters
function applyFilters() {
    lastDoc = null;
    loadTransactions();
}

// Load more transactions
function loadMoreTransactions() {
    loadTransactions(true);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Filter change listeners
    document.getElementById('typeFilter').addEventListener('change', applyFilters);
    document.getElementById('startDate').addEventListener('change', applyFilters);
    document.getElementById('endDate').addEventListener('change', applyFilters);
}); 