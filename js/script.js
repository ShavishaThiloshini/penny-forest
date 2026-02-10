// ====================
// Budget Tracker Application
// Studio Ghibli Inspired
// ====================

// DOM Elements
let currentPage = window.location.pathname.split('/').pop();

// Local Storage Keys
const STORAGE_KEYS = {
    USERS: 'forestFunds_users',
    CURRENT_USER: 'forestFunds_currentUser',
    TRANSACTIONS: 'forestFunds_transactions',
    PROFILES: 'forestFunds_profiles',
    SETTINGS: 'forestFunds_settings'
};

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication for protected pages
    const protectedPages = ['dashboard.html', 'calculator.html', 'analytics.html', 'profile.html'];
    
    if (protectedPages.includes(currentPage) || currentPage === '' || currentPage === 'index.html') {
        checkAuthentication();
    }
    
    // Initialize based on current page
    initNavigation();
    
    switch(currentPage) {
        case 'index.html':
        case '':
            initLogin();
            break;
        case 'register.html':
            initRegister();
            break;
        case 'dashboard.html':
            initDashboard();
            break;
        case 'calculator.html':
            initCalculator();
            break;
        case 'analytics.html':
            initAnalytics();
            break;
        case 'profile.html':
            initProfile();
            break;
    }
    
    // Apply saved theme
    applyTheme();
});

// ====================
// AUTHENTICATION
// ====================

function checkAuthentication() {
    const currentUser = getCurrentUser();
    const isLoginPage = currentPage === 'index.html' || currentPage === '' || currentPage === 'register.html';
    
    // If not logged in and trying to access protected page, redirect to login
    if (!currentUser && !isLoginPage) {
        window.location.href = 'index.html';
        return false;
    }
    
    // If logged in and trying to access login/register, redirect to dashboard
    if (currentUser && isLoginPage) {
        window.location.href = 'dashboard.html';
        return false;
    }
    
    return true;
}

function getUsers() {
    const users = localStorage.getItem(STORAGE_KEYS.USERS);
    return users ? JSON.parse(users) : [];
}

function saveUsers(users) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

function getCurrentUser() {
    const user = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return user ? JSON.parse(user) : null;
}

function setCurrentUser(user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
}

function logout() {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    window.location.href = 'index.html';
}

// ====================
// USER-SPECIFIC DATA
// ====================

function getUserKey(userId, baseKey) {
    return `${baseKey}_${userId}`;
}

function getTransactions() {
    const currentUser = getCurrentUser();
    if (!currentUser) return [];
    
    const userKey = getUserKey(currentUser.id, STORAGE_KEYS.TRANSACTIONS);
    const transactions = localStorage.getItem(userKey);
    return transactions ? JSON.parse(transactions) : [];
}

function saveTransaction(transaction) {
    const currentUser = getCurrentUser();
    if (!currentUser) return null;
    
    const userKey = getUserKey(currentUser.id, STORAGE_KEYS.TRANSACTIONS);
    const transactions = getTransactions();
    
    transaction.id = Date.now().toString();
    transaction.userId = currentUser.id;
    transactions.push(transaction);
    
    localStorage.setItem(userKey, JSON.stringify(transactions));
    return transaction;
}

function deleteTransaction(id) {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    const userKey = getUserKey(currentUser.id, STORAGE_KEYS.TRANSACTIONS);
    let transactions = getTransactions();
    transactions = transactions.filter(t => t.id !== id);
    
    localStorage.setItem(userKey, JSON.stringify(transactions));
}

function getTransactionsByMonth(month, year) {
    const transactions = getTransactions();
    return transactions.filter(t => {
        const date = new Date(t.date);
        return date.getMonth() === month && date.getFullYear() === year;
    });
}

function getProfile() {
    const currentUser = getCurrentUser();
    if (!currentUser) return getDefaultProfile();
    
    const userKey = getUserKey(currentUser.id, STORAGE_KEYS.PROFILES);
    const profile = localStorage.getItem(userKey);
    
    const defaultProfile = {
        name: currentUser.name,
        email: currentUser.email,
        memberSince: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        monthlyBudget: 100000,
        currency: 'LKR'
    };
    
    return profile ? JSON.parse(profile) : defaultProfile;
}

function saveProfile(profile) {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    const userKey = getUserKey(currentUser.id, STORAGE_KEYS.PROFILES);
    localStorage.setItem(userKey, JSON.stringify(profile));
}

function getSettings() {
    const currentUser = getCurrentUser();
    if (!currentUser) return getDefaultSettings();
    
    const userKey = getUserKey(currentUser.id, STORAGE_KEYS.SETTINGS);
    const settings = localStorage.getItem(userKey);
    
    const defaultSettings = {
        theme: 'light',
        notifications: true,
        reminders: true
    };
    
    return settings ? JSON.parse(settings) : defaultSettings;
}

function saveSettings(settings) {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    const userKey = getUserKey(currentUser.id, STORAGE_KEYS.SETTINGS);
    localStorage.setItem(userKey, JSON.stringify(settings));
}

function getDefaultProfile() {
    return {
        name: 'Forest Explorer',
        email: 'explorer@forestfunds.com',
        memberSince: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        monthlyBudget: 100000,
        currency: 'LKR'
    };
}

function getDefaultSettings() {
    return {
        theme: 'light',
        notifications: true,
        reminders: true
    };
}

// ====================
// LOGIN PAGE
// ====================

function initLogin() {
    // Toggle password visibility
    const togglePassword = document.getElementById('toggle-password');
    const passwordInput = document.getElementById('login-password');
    
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', () => {
            const type = passwordInput.type === 'password' ? 'text' : 'password';
            passwordInput.type = type;
            togglePassword.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
        });
    }
    
    // Login form submission
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Google login simulation
    const googleLoginBtn = document.getElementById('google-login');
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', handleGoogleLogin);
    }
    
    // Demo login
    const demoLoginBtn = document.getElementById('demo-login');
    if (demoLoginBtn) {
        demoLoginBtn.addEventListener('click', handleDemoLogin);
    }
}

function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    // Basic validation
    if (!email || !password) {
        showNotification('Please fill in all fields', 'info');
        return;
    }
    
    // Get users
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        // Set current user
        setCurrentUser(user);
        showNotification('Login successful! Welcome back!', 'success');
        
        // Redirect to dashboard
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
    } else {
        showNotification('Invalid email or password', 'info');
    }
}

function handleGoogleLogin() {
    // Simulate Google OAuth
    showNotification('Google OAuth would redirect to Google login in a real app', 'info');
    
    // For demo purposes, create a Google user
    const googleUser = {
        id: 'google_' + Date.now(),
        name: 'Google User',
        email: 'google.user@example.com',
        provider: 'google',
        createdAt: new Date().toISOString()
    };
    
    // Check if user exists
    const users = getUsers();
    const existingUser = users.find(u => u.email === googleUser.email);
    
    if (existingUser) {
        setCurrentUser(existingUser);
    } else {
        // Add new Google user
        users.push(googleUser);
        saveUsers(users);
        setCurrentUser(googleUser);
    }
    
    showNotification('Google login successful!', 'success');
    
    setTimeout(() => {
        window.location.href = 'dashboard.html';
    }, 1000);
}

function handleDemoLogin() {
    // Demo user credentials
    const demoUser = {
        id: 'demo_' + Date.now(),
        name: 'Demo Explorer',
        email: 'demo@forestfunds.com',
        password: 'demo123',
        createdAt: new Date().toISOString()
    };
    
    // Check if demo user exists
    const users = getUsers();
    let existingUser = users.find(u => u.email === demoUser.email);
    
    if (!existingUser) {
        users.push(demoUser);
        saveUsers(users);
        existingUser = demoUser;
    }
    
    // Auto-fill login form
    document.getElementById('login-email').value = demoUser.email;
    document.getElementById('login-password').value = 'demo123';
    
    showNotification('Demo credentials filled. Click Sign In to continue.', 'info');
}

// ====================
// REGISTER PAGE
// ====================

function initRegister() {
    // Toggle password visibility
    const togglePassword = document.getElementById('toggle-register-password');
    const passwordInput = document.getElementById('register-password');
    
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', () => {
            const type = passwordInput.type === 'password' ? 'text' : 'password';
            passwordInput.type = type;
            togglePassword.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
        });
    }
    
    // Registration form submission
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // Google register simulation
    const googleRegisterBtn = document.getElementById('google-register');
    if (googleRegisterBtn) {
        googleRegisterBtn.addEventListener('click', handleGoogleRegister);
    }
}

function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const monthlyBudget = document.getElementById('monthly-budget').value;
    
    // Validation
    if (!name || !email || !password || !confirmPassword) {
        showNotification('Please fill in all fields', 'info');
        return;
    }
    
    if (password.length < 8) {
        showNotification('Password must be at least 8 characters', 'info');
        return;
    }
    
    if (password !== confirmPassword) {
        showNotification('Passwords do not match', 'info');
        return;
    }
    
    // Check if user already exists
    const users = getUsers();
    const existingUser = users.find(u => u.email === email);
    
    if (existingUser) {
        showNotification('User with this email already exists', 'info');
        return;
    }
    
    // Create new user
    const newUser = {
        id: 'user_' + Date.now(),
        name,
        email,
        password,
        monthlyBudget: parseFloat(monthlyBudget) || 100000,
        createdAt: new Date().toISOString()
    };
    
    // Save user
    users.push(newUser);
    saveUsers(users);
    
    // Set as current user
    setCurrentUser(newUser);
    
    // Create user profile
    const userProfile = {
        name,
        email,
        memberSince: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        monthlyBudget: parseFloat(monthlyBudget) || 100000,
        currency: 'LKR'
    };
    
    saveProfile(userProfile);
    
    showNotification('Registration successful! Welcome to Forest Funds!', 'success');
    
    // Redirect to dashboard
    setTimeout(() => {
        window.location.href = 'dashboard.html';
    }, 1500);
}

function handleGoogleRegister() {
    // Same as Google login for registration
    handleGoogleLogin();
}

// ====================
// NAVIGATION
// ====================

function initNavigation() {
    // Mobile menu toggle
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileToggle && navLinks) {
        mobileToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.navbar') && navLinks) {
            navLinks.classList.remove('active');
        }
    });
    
    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    // Update user greeting
    updateUserGreeting();
}

function updateUserGreeting() {
    const currentUser = getCurrentUser();
    const greetingElement = document.getElementById('user-greeting');
    
    if (greetingElement && currentUser) {
        // Use first name if available
        const firstName = currentUser.name.split(' ')[0];
        greetingElement.textContent = firstName;
    }
}

// ====================
// DASHBOARD PAGE
// ====================

function initDashboard() {
    if (!checkAuthentication()) return;
    
    updateDashboardTotals();
    loadRecentTransactions();
    loadBudgetProgress();
    
    // Refresh data every minute
    setInterval(() => {
        updateDashboardTotals();
        loadRecentTransactions();
    }, 60000);
}

function updateDashboardTotals() {
    const transactions = getTransactions();
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyTransactions = transactions.filter(t => {
        const date = new Date(t.date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });
    
    let totalIncome = 0;
    let totalExpenses = 0;
    
    monthlyTransactions.forEach(t => {
        if (t.type === 'income') {
            totalIncome += parseFloat(t.amount);
        } else {
            totalExpenses += parseFloat(t.amount);
        }
    });
    
    const balance = totalIncome - totalExpenses;
    
    // Update UI
    const currency = getProfile().currency;
    document.getElementById('total-income').textContent = `${currency} ${totalIncome.toLocaleString()}`;
    document.getElementById('total-expenses').textContent = `${currency} ${totalExpenses.toLocaleString()}`;
    document.getElementById('balance').textContent = `${currency} ${balance.toLocaleString()}`;
}

function loadRecentTransactions() {
    const transactions = getTransactions();
    const transactionsList = document.getElementById('transactions-list');
    
    if (!transactionsList) return;
    
    // Sort by date (newest first)
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Get last 5 transactions
    const recentTransactions = transactions.slice(0, 5);
    
    if (recentTransactions.length === 0) {
        transactionsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-wind"></i>
                <p>No transactions yet. Add your first one!</p>
                <a href="calculator.html" class="btn-secondary btn-small">
                    <i class="fas fa-plus"></i> Add Transaction
                </a>
            </div>
        `;
        return;
    }
    
    let html = '';
    recentTransactions.forEach(transaction => {
        const date = new Date(transaction.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
        
        const categoryIcon = getCategoryIcon(transaction.category);
        
        html += `
            <div class="transaction-item">
                <div class="transaction-info">
                    <h4>${transaction.description}</h4>
                    <div class="transaction-category">
                        ${categoryIcon} ${transaction.category} • ${date}
                    </div>
                </div>
                <div class="transaction-amount ${transaction.type}">
                    ${transaction.type === 'expense' ? '-' : '+'}${getProfile().currency} ${parseFloat(transaction.amount).toLocaleString()}
                </div>
            </div>
        `;
    });
    
    transactionsList.innerHTML = html;
}

function loadBudgetProgress() {
    const profile = getProfile();
    const monthlyBudget = profile.monthlyBudget || 100000;
    const currency = profile.currency;
    
    const transactions = getTransactions();
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyExpenses = transactions
        .filter(t => {
            const date = new Date(t.date);
            return date.getMonth() === currentMonth && 
                   date.getFullYear() === currentYear &&
                   t.type === 'expense';
        })
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    const progressPercent = Math.min((monthlyExpenses / monthlyBudget) * 100, 100);
    
    document.getElementById('spent-amount').textContent = `${currency} ${monthlyExpenses.toLocaleString()}`;
    document.getElementById('total-budget').textContent = `${currency} ${monthlyBudget.toLocaleString()}`;
    
    const progressBar = document.getElementById('budget-progress');
    if (progressBar) {
        progressBar.style.width = `${progressPercent}%`;
    }
}

// ====================
// CALCULATOR PAGE
// ====================

function initCalculator() {
    if (!checkAuthentication()) return;
    
    // Set today's date as default
    document.getElementById('date').valueAsDate = new Date();
    
    // Type selector
    const typeOptions = document.querySelectorAll('.type-option');
    const typeInput = document.getElementById('type');
    
    typeOptions.forEach(option => {
        option.addEventListener('click', () => {
            typeOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            typeInput.value = option.dataset.type;
        });
    });
    
    // Form submission
    const form = document.getElementById('expense-form');
    form.addEventListener('submit', handleTransactionSubmit);
    
    // Clear button
    const clearBtn = document.getElementById('clear-btn');
    clearBtn.addEventListener('click', () => {
        form.reset();
        document.getElementById('date').valueAsDate = new Date();
        typeOptions[0].click();
    });
    
    // Load current balance and recent transactions
    updateCalculatorBalance();
    loadRecentTransactionsMini();
}

function handleTransactionSubmit(e) {
    e.preventDefault();
    
    const amount = document.getElementById('amount').value;
    const category = document.getElementById('category').value;
    const description = document.getElementById('description').value;
    const type = document.getElementById('type').value;
    const date = document.getElementById('date').value;
    
    // Validation
    if (!amount || !category || !description || !date) {
        alert('Please fill in all fields');
        return;
    }
    
    if (parseFloat(amount) <= 0) {
        alert('Amount must be greater than 0');
        return;
    }
    
    // Save transaction
    const transaction = {
        amount: parseFloat(amount),
        category,
        description,
        type,
        date
    };
    
    saveTransaction(transaction);
    
    // Update UI
    updateCalculatorBalance();
    loadRecentTransactionsMini();
    
    // Show success message
    showNotification('Transaction saved successfully!', 'success');
    
    // Reset form (but keep type and date)
    document.getElementById('amount').value = '';
    document.getElementById('category').value = '';
    document.getElementById('description').value = '';
}

function updateCalculatorBalance() {
    const transactions = getTransactions();
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyTransactions = transactions.filter(t => {
        const date = new Date(t.date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });
    
    let balance = 0;
    monthlyTransactions.forEach(t => {
        if (t.type === 'income') {
            balance += parseFloat(t.amount);
        } else {
            balance -= parseFloat(t.amount);
        }
    });
    
    const currency = getProfile().currency;
    const balanceElement = document.getElementById('current-balance');
    if (balanceElement) {
        balanceElement.textContent = `${currency} ${balance.toLocaleString()}`;
    }
}

function loadRecentTransactionsMini() {
    const transactions = getTransactions();
    const recentList = document.getElementById('recent-transactions');
    
    if (!recentList) return;
    
    // Sort by date (newest first)
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Get last 3 transactions
    const recentTransactions = transactions.slice(0, 3);
    
    if (recentTransactions.length === 0) {
        recentList.innerHTML = '<p class="empty-text">No recent transactions</p>';
        return;
    }
    
    let html = '';
    recentTransactions.forEach(transaction => {
        const date = new Date(transaction.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
        
        html += `
            <div class="transaction-mini-item">
                <div class="transaction-mini-info">
                    <strong>${transaction.description}</strong>
                    <small>${transaction.category} • ${date}</small>
                </div>
                <div class="transaction-mini-amount ${transaction.type}">
                    ${transaction.type === 'expense' ? '-' : '+'}${getProfile().currency} ${parseFloat(transaction.amount).toLocaleString()}
                </div>
            </div>
        `;
    });
    
    recentList.innerHTML = html;
}

// ====================
// ANALYTICS PAGE
// ====================

function initAnalytics() {
    if (!checkAuthentication()) return;
    
    // Initialize year dropdown
    initYearDropdown();
    
    // Set current month as default
    const currentMonth = new Date().getMonth();
    document.getElementById('month-select').value = currentMonth;
    
    // Load data for current month
    loadAnalyticsData(currentMonth, new Date().getFullYear());
    
    // Add event listeners for month/year changes
    document.getElementById('month-select').addEventListener('change', handleMonthChange);
    document.getElementById('year-select').addEventListener('change', handleMonthChange);
    
    // Initialize charts
    initCharts();
}

function initYearDropdown() {
    const yearSelect = document.getElementById('year-select');
    const currentYear = new Date().getFullYear();
    
    // Clear existing options
    yearSelect.innerHTML = '';
    
    // Add years from 2020 to current year + 1
    for (let year = 2020; year <= currentYear + 1; year++) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        option.selected = year === currentYear;
        yearSelect.appendChild(option);
    }
}

function handleMonthChange() {
    const month = parseInt(document.getElementById('month-select').value);
    const year = parseInt(document.getElementById('year-select').value);
    loadAnalyticsData(month, year);
}

function loadAnalyticsData(month, year) {
    const transactions = getTransactionsByMonth(month, year);
    
    // Calculate totals
    let totalIncome = 0;
    let totalExpenses = 0;
    const categoryTotals = {};
    
    transactions.forEach(t => {
        if (t.type === 'income') {
            totalIncome += parseFloat(t.amount);
        } else {
            totalExpenses += parseFloat(t.amount);
            categoryTotals[t.category] = (categoryTotals[t.category] || 0) + parseFloat(t.amount);
        }
    });
    
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100).toFixed(1) : 0;
    
    // Update UI
    const currency = getProfile().currency;
    document.getElementById('analytics-income').textContent = `${currency} ${totalIncome.toLocaleString()}`;
    document.getElementById('analytics-expenses').textContent = `${currency} ${totalExpenses.toLocaleString()}`;
    document.getElementById('savings-rate').textContent = `${savingsRate}%`;
    
    // Update charts
    updateMonthlyFlowChart(month, year);
    updateCategoryChart(categoryTotals);
    updateCategoryBreakdown(categoryTotals);
    
    // Calculate percentage changes from previous month
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const prevTransactions = getTransactionsByMonth(prevMonth, prevYear);
    
    let prevIncome = 0;
    let prevExpenses = 0;
    
    prevTransactions.forEach(t => {
        if (t.type === 'income') {
            prevIncome += parseFloat(t.amount);
        } else {
            prevExpenses += parseFloat(t.amount);
        }
    });
    
    const incomeChange = prevIncome > 0 ? ((totalIncome - prevIncome) / prevIncome * 100).toFixed(1) : 0;
    const expenseChange = prevExpenses > 0 ? ((totalExpenses - prevExpenses) / prevExpenses * 100).toFixed(1) : 0;
    
    // Update change indicators
    const changeElements = document.querySelectorAll('.analytics-change');
    if (changeElements[0]) {
        changeElements[0].textContent = 
            `${incomeChange >= 0 ? '+' : ''}${incomeChange}% from last month`;
    }
    if (changeElements[1]) {
        changeElements[1].textContent = 
            `${expenseChange >= 0 ? '+' : ''}${expenseChange}% from last month`;
    }
}

let monthlyFlowChart, categoryChart;

function initCharts() {
    const monthlyFlowCtx = document.getElementById('monthlyFlowChart');
    const categoryCtx = document.getElementById('categoryChart');
    
    if (!monthlyFlowCtx || !categoryCtx) return;
    
    // Studio Ghibli inspired colors
    const ghibliColors = {
        blue: '#4FC3F7',
        green: '#81C784',
        pink: '#FF8A80',
        yellow: '#FFF176',
        purple: '#9575CD',
        orange: '#FFB74D',
        teal: '#4DB6AC'
    };
    
    // Monthly Flow Chart (Line Chart)
    monthlyFlowChart = new Chart(monthlyFlowCtx.getContext('2d'), {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [
                {
                    label: 'Income',
                    data: [],
                    borderColor: ghibliColors.green,
                    backgroundColor: 'rgba(129, 199, 132, 0.1)',
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Expenses',
                    data: [],
                    borderColor: ghibliColors.pink,
                    backgroundColor: 'rgba(255, 138, 128, 0.1)',
                    fill: true,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return getProfile().currency + ' ' + value.toLocaleString();
                        }
                    }
                }
            }
        }
    });
    
    // Category Chart (Doughnut Chart)
    categoryChart = new Chart(categoryCtx.getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [
                    ghibliColors.blue,
                    ghibliColors.green,
                    ghibliColors.pink,
                    ghibliColors.yellow,
                    ghibliColors.purple,
                    ghibliColors.orange,
                    ghibliColors.teal
                ],
                borderWidth: 2,
                borderColor: 'white'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                }
            },
            cutout: '60%'
        }
    });
}

function updateMonthlyFlowChart(selectedMonth, selectedYear) {
    if (!monthlyFlowChart) return;
    
    const year = selectedYear || new Date().getFullYear();
    const incomeData = new Array(12).fill(0);
    const expenseData = new Array(12).fill(0);
    
    // Get all transactions for the year
    const allTransactions = getTransactions();
    
    allTransactions.forEach(t => {
        const date = new Date(t.date);
        if (date.getFullYear() === year) {
            const month = date.getMonth();
            if (t.type === 'income') {
                incomeData[month] += parseFloat(t.amount);
            } else {
                expenseData[month] += parseFloat(t.amount);
            }
        }
    });
    
    // Update chart data
    monthlyFlowChart.data.datasets[0].data = incomeData;
    monthlyFlowChart.data.datasets[1].data = expenseData;
    monthlyFlowChart.update();
}

function updateCategoryChart(categoryTotals) {
    if (!categoryChart) return;
    
    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);
    
    categoryChart.data.labels = labels;
    categoryChart.data.datasets[0].data = data;
    categoryChart.update();
}

function updateCategoryBreakdown(categoryTotals) {
    const categoriesList = document.getElementById('categories-list');
    if (!categoriesList) return;
    
    const currency = getProfile().currency;
    
    let html = '';
    const sortedCategories = Object.entries(categoryTotals)
        .sort((a, b) => b[1] - a[1]);
    
    sortedCategories.forEach(([category, amount]) => {
        const icon = getCategoryIcon(category);
        html += `
            <div class="category-item">
                <div class="category-name">
                    ${icon}
                    <span>${category}</span>
                </div>
                <div class="category-amount">
                    ${currency} ${amount.toLocaleString()}
                </div>
            </div>
        `;
    });
    
    categoriesList.innerHTML = html || '<p>No expenses for this month</p>';
}

// ====================
// PROFILE PAGE
// ====================

function initProfile() {
    if (!checkAuthentication()) return;
    
    // Load profile data
    loadProfileData();
    
    // Load stats
    loadProfileStats();
    
    // Form submission
    const profileForm = document.getElementById('profile-form');
    profileForm.addEventListener('submit', handleProfileSubmit);
    
    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    themeToggle.addEventListener('click', toggleTheme);
    
    // Export data
    document.getElementById('export-data').addEventListener('click', exportData);
    
    // Reset data
    document.getElementById('reset-data').addEventListener('click', resetData);
}

function loadProfileData() {
    const profile = getProfile();
    const settings = getSettings();
    
    // Set form values
    document.getElementById('name').value = profile.name;
    document.getElementById('email').value = profile.email;
    document.getElementById('monthly-budget').value = profile.monthlyBudget || 100000;
    document.getElementById('currency').value = profile.currency || 'LKR';
    document.getElementById('member-since').textContent = profile.memberSince;
    
    // Update avatar
    document.getElementById('user-name').textContent = profile.name;
    document.getElementById('user-email').textContent = profile.email;
    
    // Set theme toggle
    if (settings.theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
    
    // Set notification toggles
    document.getElementById('notifications').checked = settings.notifications;
    document.getElementById('reminders').checked = settings.reminders;
}

function loadProfileStats() {
    const transactions = getTransactions();
    const profile = getProfile();
    const currency = profile.currency;
    
    // Total transactions
    document.getElementById('total-transactions').textContent = transactions.length;
    
    // Months tracked
    const months = new Set();
    transactions.forEach(t => {
        const date = new Date(t.date);
        months.add(`${date.getFullYear()}-${date.getMonth()}`);
    });
    document.getElementById('months-tracked').textContent = months.size || 1;
    
    // Biggest expense
    const expenses = transactions.filter(t => t.type === 'expense');
    const biggestExpense = expenses.length > 0 ? 
        Math.max(...expenses.map(e => parseFloat(e.amount))) : 0;
    document.getElementById('biggest-expense').textContent = `${currency} ${biggestExpense.toLocaleString()}`;
    
    // Total saved (income - expenses)
    let totalIncome = 0;
    let totalExpenses = 0;
    
    transactions.forEach(t => {
        if (t.type === 'income') {
            totalIncome += parseFloat(t.amount);
        } else {
            totalExpenses += parseFloat(t.amount);
        }
    });
    
    const totalSaved = totalIncome - totalExpenses;
    document.getElementById('total-saved').textContent = `${currency} ${totalSaved.toLocaleString()}`;
}

function handleProfileSubmit(e) {
    e.preventDefault();
    
    const profile = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        monthlyBudget: parseFloat(document.getElementById('monthly-budget').value),
        currency: document.getElementById('currency').value,
        memberSince: getProfile().memberSince || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    };
    
    // Save profile
    saveProfile(profile);
    
    // Save settings
    const settings = {
        theme: getSettings().theme,
        notifications: document.getElementById('notifications').checked,
        reminders: document.getElementById('reminders').checked
    };
    saveSettings(settings);
    
    // Update UI
    loadProfileData();
    
    // Show success message
    showNotification('Profile saved successfully!', 'success');
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    
    // Save theme preference
    const settings = getSettings();
    settings.theme = newTheme;
    saveSettings(settings);
}

function applyTheme() {
    const settings = getSettings();
    if (settings.theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
}

function exportData() {
    const transactions = getTransactions();
    const profile = getProfile();
    const currentUser = getCurrentUser();
    
    const data = {
        user: currentUser,
        profile,
        transactions,
        exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `forest-funds-${currentUser?.name || 'user'}-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showNotification('Data exported successfully!', 'success');
}

function resetData() {
    if (confirm('Are you sure you want to reset all your transaction data? This cannot be undone.')) {
        const currentUser = getCurrentUser();
        if (!currentUser) return;
        
        const userKey = getUserKey(currentUser.id, STORAGE_KEYS.TRANSACTIONS);
        localStorage.removeItem(userKey);
        
        showNotification('All transaction data has been reset', 'info');
        
        // Reload page to reflect changes
        setTimeout(() => location.reload(), 1000);
    }
}

// ====================
// UTILITY FUNCTIONS
// ====================

function getCategoryIcon(category) {
    const icons = {
        'Food': 'fas fa-utensils',
        'Transport': 'fas fa-bus',
        'Home': 'fas fa-home',
        'Health': 'fas fa-heartbeat',
        'Entertainment': 'fas fa-film',
        'Gifts': 'fas fa-gift',
        'Other': 'fas fa-circle'
    };
    
    const iconClass = icons[category] || 'fas fa-circle';
    return `<i class="${iconClass}"></i>`;
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Show with animation
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ====================
// AVATAR FUNCTIONALITY
// ====================

function initAvatar() {
    const changeAvatarBtn = document.getElementById('change-avatar');
    const avatarModal = document.getElementById('avatar-modal');
    const closeModalBtn = document.querySelector('.close-modal');
    const cancelAvatarBtn = document.getElementById('cancel-avatar');
    const saveAvatarBtn = document.getElementById('save-avatar');
    const avatarOptions = document.querySelectorAll('.avatar-option');
    const uploadArea = document.getElementById('upload-area');
    const avatarUploadInput = document.getElementById('avatar-upload');
    
    let selectedAvatar = getCurrentAvatar() || '1';
    let uploadedImage = null;
    
    // Load current avatar
    loadAvatar(selectedAvatar);
    
    // Open modal when Change button is clicked
    if (changeAvatarBtn) {
        changeAvatarBtn.addEventListener('click', () => {
            openAvatarModal();
        });
    }
    
    // Close modal functions
    const closeModal = () => {
        avatarModal.classList.remove('show');
        // Reset selection to current avatar
        selectedAvatar = getCurrentAvatar() || '1';
        uploadedImage = null;
        updateAvatarSelection();
    };
    
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (cancelAvatarBtn) cancelAvatarBtn.addEventListener('click', closeModal);
    
    // Close modal when clicking outside
    if (avatarModal) {
        avatarModal.addEventListener('click', (e) => {
            if (e.target === avatarModal) {
                closeModal();
            }
        });
    }
    
    // Avatar option selection
    avatarOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Remove selected class from all options
            avatarOptions.forEach(opt => opt.classList.remove('selected'));
            // Add selected class to clicked option
            option.classList.add('selected');
            selectedAvatar = option.dataset.avatar;
            uploadedImage = null; // Clear uploaded image when selecting preset
        });
    });
    
    // Upload area click
    if (uploadArea) {
        uploadArea.addEventListener('click', () => {
            avatarUploadInput.click();
        });
    }
    
    // Handle file upload
    if (avatarUploadInput) {
        avatarUploadInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                // Check file size (max 2MB)
                if (file.size > 2 * 1024 * 1024) {
                    showNotification('File size must be less than 2MB', 'info');
                    return;
                }
                
                // Check file type
                if (!file.type.match('image.*')) {
                    showNotification('Please select an image file', 'info');
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = (e) => {
                    uploadedImage = e.target.result;
                    // Select custom avatar
                    avatarOptions.forEach(opt => opt.classList.remove('selected'));
                    selectedAvatar = 'custom';
                    
                    // Show preview
                    uploadArea.innerHTML = `
                        <img src="${uploadedImage}" alt="Uploaded Avatar" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover;">
                        <p>Image ready</p>
                    `;
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    // Save avatar
    if (saveAvatarBtn) {
        saveAvatarBtn.addEventListener('click', () => {
            saveAvatar(selectedAvatar, uploadedImage);
            loadAvatar(selectedAvatar, uploadedImage);
            closeModal();
            showNotification('Avatar updated successfully!', 'success');
        });
    }
    
    // Initialize avatar selection in modal
    updateAvatarSelection();
    
    function updateAvatarSelection() {
        avatarOptions.forEach(option => {
            option.classList.remove('selected');
            if (option.dataset.avatar === selectedAvatar) {
                option.classList.add('selected');
            }
        });
        
        // Reset upload area
        if (uploadArea && !uploadedImage) {
            uploadArea.innerHTML = `
                <i class="fas fa-cloud-upload-alt"></i>
                <p>Click to upload image</p>
            `;
        }
    }
    
    function openAvatarModal() {
        selectedAvatar = getCurrentAvatar() || '1';
        uploadedImage = getUploadedAvatar();
        updateAvatarSelection();
        avatarModal.classList.add('show');
    }
}

function getCurrentAvatar() {
    const currentUser = getCurrentUser();
    if (!currentUser) return '1';
    
    const userKey = getUserKey(currentUser.id, 'avatar');
    return localStorage.getItem(userKey) || '1';
}

function getUploadedAvatar() {
    const currentUser = getCurrentUser();
    if (!currentUser) return null;
    
    const userKey = getUserKey(currentUser.id, 'avatar_image');
    return localStorage.getItem(userKey);
}

function saveAvatar(avatarType, imageData = null) {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    // Save avatar type
    const avatarKey = getUserKey(currentUser.id, 'avatar');
    localStorage.setItem(avatarKey, avatarType);
    
    // Save uploaded image if exists
    if (imageData) {
        const imageKey = getUserKey(currentUser.id, 'avatar_image');
        localStorage.setItem(imageKey, imageData);
    } else {
        // Clear uploaded image if switching to preset
        const imageKey = getUserKey(currentUser.id, 'avatar_image');
        localStorage.removeItem(imageKey);
    }
}

function loadAvatar(avatarType = null, imageData = null) {
    const avatarImg = document.getElementById('avatar-img');
    if (!avatarImg) return;
    
    // Get saved avatar if not provided
    if (!avatarType) {
        avatarType = getCurrentAvatar() || '1';
        imageData = getUploadedAvatar();
    }
    
    // Clear existing content
    avatarImg.innerHTML = '';
    avatarImg.className = 'avatar-img';
    
    // Add appropriate class for color
    avatarImg.classList.add(`avatar-${avatarType}`);
    
    if (avatarType === 'custom' && imageData) {
        // Display uploaded image
        const img = document.createElement('img');
        img.src = imageData;
        img.alt = 'Profile Picture';
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.borderRadius = '50%';
        img.style.objectFit = 'cover';
        avatarImg.appendChild(img);
    } else {
        // Display icon based on avatar type
        const icons = {
            '1': 'fas fa-user',
            '2': 'fas fa-leaf',
            '3': 'fas fa-cat',
            '4': 'fas fa-dragon',
            '5': 'fas fa-robot',
            '6': 'fas fa-feather-alt'
        };
        
        const iconClass = icons[avatarType] || 'fas fa-user';
        const icon = document.createElement('i');
        icon.className = iconClass;
        avatarImg.appendChild(icon);
    }
}

// Update the initProfile function to include avatar initialization
function initProfile() {
    if (!checkAuthentication()) return;
    
    // Load profile data
    loadProfileData();
    
    // Load stats
    loadProfileStats();
    
    // Initialize avatar
    initAvatar();
    
    // Form submission
    const profileForm = document.getElementById('profile-form');
    profileForm.addEventListener('submit', handleProfileSubmit);
    
    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    themeToggle.addEventListener('click', toggleTheme);
    
    // Export data
    document.getElementById('export-data').addEventListener('click', exportData);
    
    // Reset data
    document.getElementById('reset-data').addEventListener('click', resetData);
}

// Update loadProfileData to load avatar
function loadProfileData() {
    const profile = getProfile();
    const settings = getSettings();
    
    // Set form values
    document.getElementById('name').value = profile.name;
    document.getElementById('email').value = profile.email;
    document.getElementById('monthly-budget').value = profile.monthlyBudget || 100000;
    document.getElementById('currency').value = profile.currency || 'LKR';
    document.getElementById('member-since').textContent = profile.memberSince;
    
    // Update avatar
    loadAvatar();
    
    // Update user info
    document.getElementById('user-name').textContent = profile.name;
    document.getElementById('user-email').textContent = profile.email;
    
    // Set theme toggle
    if (settings.theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
    
    // Set notification toggles
    document.getElementById('notifications').checked = settings.notifications;
    document.getElementById('reminders').checked = settings.reminders;
}
// Note: Removed the loadInitialData() function since we want blank data initially
