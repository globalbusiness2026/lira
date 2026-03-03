// ==================== LIRA GLOBAL SCRIPT ====================

// API Base URL
const API_BASE = window.location.origin;

// Toast Notification System
class Toast {
    constructor() {
        this.container = document.createElement('div');
        this.container.className = 'toast-container';
        document.body.appendChild(this.container);
    }
    
    show(message, type = 'info', title = '') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = this.getIcon(type);
        
        toast.innerHTML = `
            <div class="toast-icon">${icon}</div>
            <div class="toast-content">
                <div class="toast-title">${title || this.getTitle(type)}</div>
                <div class="toast-message">${message}</div>
            </div>
            <div class="toast-close" onclick="this.parentElement.remove()">&times;</div>
        `;
        
        this.container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 5000);
    }
    
    getIcon(type) {
        const icons = {
            success: '<i class="fas fa-check-circle"></i>',
            error: '<i class="fas fa-times-circle"></i>',
            warning: '<i class="fas fa-exclamation-circle"></i>',
            info: '<i class="fas fa-info-circle"></i>'
        };
        return icons[type] || icons.info;
    }
    
    getTitle(type) {
        const titles = {
            success: 'Success',
            error: 'Error',
            warning: 'Warning',
            info: 'Information'
        };
        return titles[type] || 'Notification';
    }
}

// Initialize Toast
const toast = new Toast();

// ==================== SESSION MANAGEMENT ====================

// Check if user is logged in
async function checkAuth() {
    try {
        const response = await fetch('/api/session');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Auth check error:', error);
        return { loggedIn: false };
    }
}

// Logout function
async function logout() {
    if (confirm('Are you sure you want to logout?')) {
        try {
            const response = await fetch('/api/logout', { method: 'POST' });
            const data = await response.json();
            if (data.success) {
                window.location.href = '/';
            }
        } catch (error) {
            console.error('Logout error:', error);
            toast.show('Logout failed', 'error');
        }
    }
}

// ==================== CART MANAGEMENT ====================

// Add to cart
async function addToCart(productId, quantity = 1) {
    const session = await checkAuth();
    if (!session.loggedIn) {
        if (confirm('Please login to add items to cart')) {
            window.location.href = '/login';
        }
        return;
    }
    
    try {
        const response = await fetch('/api/cart/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId, quantity })
        });
        
        const data = await response.json();
        if (data.success) {
            toast.show('Product added to cart!', 'success');
            updateCartCount();
        } else {
            toast.show(data.error || 'Failed to add to cart', 'error');
        }
    } catch (error) {
        console.error('Add to cart error:', error);
        toast.show('Failed to add to cart', 'error');
    }
}

// Update cart count
async function updateCartCount() {
    try {
        const response = await fetch('/api/cart');
        const data = await response.json();
        const cart = data.cart || [];
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        
        const cartBadge = document.querySelector('.cart-badge');
        if (cartBadge) {
            cartBadge.textContent = totalItems;
            cartBadge.style.display = totalItems > 0 ? 'flex' : 'none';
        }
    } catch (error) {
        console.error('Update cart count error:', error);
    }
}

// ==================== PRODUCT LOADING ====================

// Load products
async function loadProducts(category = 'all', page = 1) {
    try {
        const response = await fetch(`/api/products?category=${category}&page=${page}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Load products error:', error);
        return { products: [], total: 0 };
    }
}

// Load categories
async function loadCategories() {
    try {
        const response = await fetch('/api/categories');
        const categories = await response.json();
        return categories;
    } catch (error) {
        console.error('Load categories error:', error);
        return [];
    }
}

// ==================== TOP BUYERS ====================

// Load top buyers
async function loadTopBuyers() {
    try {
        const response = await fetch('/api/top-buyers');
        const buyers = await response.json();
        return buyers;
    } catch (error) {
        console.error('Load top buyers error:', error);
        return [];
    }
}

// ==================== TODAY SPECIALS ====================

// Load today's specials (birthdays & anniversaries)
async function loadTodaySpecials() {
    try {
        const response = await fetch('/api/today-special');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Load today specials error:', error);
        return { birthdays: [], anniversaries: [] };
    }
}

// ==================== REWARDS ====================

// Load rewards
async function loadRewards() {
    try {
        const response = await fetch('/api/rewards');
        const rewards = await response.json();
        return rewards;
    } catch (error) {
        console.error('Load rewards error:', error);
        return [];
    }
}

// ==================== NEWS TICKER ====================

// Load news ticker
function loadNewsTicker() {
    const news = [
        '🎉 New member joined: Rahul just earned ₹5000!',
        '🏆 Micro Franchise achieved by Priya!',
        '💰 Record breaking purchase of ₹1,00,000 by Amit!',
        '🎂 Happy Birthday to our 10 members today!',
        '🚀 LIRA crosses 10,000 active members!',
        '💎 New Diamond Collection launched!',
        '🎁 Special rewards for top performers this month',
        '📦 Free delivery on orders above ₹5000'
    ];
    
    const ticker = document.getElementById('newsTicker');
    if (!ticker) return;
    
    ticker.innerHTML = '';
    news.forEach(item => {
        const div = document.createElement('div');
        div.className = 'ticker-item';
        div.innerHTML = `<i class="fas fa-star"></i> ${item}`;
        ticker.appendChild(div);
    });
}

// ==================== MOBILE MENU ====================

// Initialize mobile menu
function initMobileMenu() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.nav-menu');
    
    if (menuBtn && navMenu) {
        menuBtn.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!menuBtn.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
            }
        });
    }
}

// ==================== FORMS VALIDATION ====================

// Validate email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Validate mobile
function validateMobile(mobile) {
    const re = /^[6-9]\d{9}$/;
    return re.test(mobile);
}

// Validate password
function validatePassword(password) {
    return password.length >= 6;
}

// ==================== INITIALIZATION ====================

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    console.log('LIRA site loaded');
    
    // Initialize mobile menu
    initMobileMenu();
    
    // Update cart count
    updateCartCount();
    
    // Load news ticker
    loadNewsTicker();
    
    // Check if we're on the homepage
    if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
        // Load products
        const products = await loadProducts();
        const productGrid = document.getElementById('productGrid');
        if (productGrid && products.products) {
            // Render products (implementation in index page)
        }
        
        // Load categories
        const categories = await loadCategories();
        const categoryTabs = document.getElementById('categoryTabs');
        if (categoryTabs && categories.length > 0) {
            // Render categories (implementation in index page)
        }
        
        // Load top buyers
        const buyers = await loadTopBuyers();
        const topBuyersList = document.getElementById('topBuyersList');
        if (topBuyersList && buyers.length > 0) {
            // Render top buyers (implementation in index page)
        }
        
        // Load today specials
        const specials = await loadTodaySpecials();
        const birthdayList = document.getElementById('birthdayList');
        const anniversaryList = document.getElementById('anniversaryList');
        
        if (birthdayList && specials.birthdays) {
            // Render birthdays
        }
        if (anniversaryList && specials.anniversaries) {
            // Render anniversaries
        }
        
        // Load rewards
        const rewards = await loadRewards();
        const rewardsGrid = document.getElementById('rewardsGrid');
        if (rewardsGrid && rewards.length > 0) {
            // Render rewards (implementation in index page)
        }
    }
});

// ==================== UTILITY FUNCTIONS ====================

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

// Format date
function formatDate(date) {
    return new Date(date).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}

// Format datetime
function formatDateTime(date) {
    return new Date(date).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Show loading
function showLoading(element) {
    if (element) {
        element.innerHTML = '<div class="loader"></div>';
    }
}

// Hide loading
function hideLoading(element, content) {
    if (element) {
        element.innerHTML = content;
    }
}

// Copy to clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        toast.show('Copied to clipboard!', 'success');
    }).catch(() => {
        toast.show('Failed to copy', 'error');
    });
}

// Download file
function downloadFile(url, filename) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// ==================== ERROR HANDLING ====================

// Global error handler
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
    toast.show('An error occurred', 'error');
});

// Unhandled promise rejection
window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled rejection:', e.reason);
    toast.show('An error occurred', 'error');
});

// ==================== EXPORT FUNCTIONS ====================

// Make functions globally available
window.addToCart = addToCart;
window.logout = logout;
window.formatCurrency = formatCurrency;
window.formatDate = formatDate;
window.copyToClipboard = copyToClipboard;
