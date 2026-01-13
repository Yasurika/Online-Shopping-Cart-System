// User Settings Management Module
const UserSettings = (() => {
    const config = {
        storageKey: 'userSettings',
        settingsSections: ['account', 'security', 'notifications', 'privacy', 'preferences']
    };

    // Initialize settings module
    const init = () => {
        setupEventListeners();
        loadSettings();
    };

    // Setup event listeners
    const setupEventListeners = () => {
        const menuItems = document.querySelectorAll('.settings-menu-item');
        menuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                openSection(e, item.getAttribute('onclick').match(/'([^']+)'/)[1]);
            });
        });
    };

    // Open settings section
    const openSection = (event, sectionName) => {
        // Hide all sections
        const sections = document.querySelectorAll('.setting-section');
        sections.forEach(section => section.classList.remove('active'));

        // Remove active class from all menu items
        const menuItems = document.querySelectorAll('.settings-menu-item');
        menuItems.forEach(item => item.classList.remove('active'));

        // Show selected section
        const selectedSection = document.getElementById(sectionName);
        if (selectedSection) {
            selectedSection.classList.add('active');
        }

        // Add active class to clicked menu item
        if (event && event.target) {
            event.target.classList.add('active');
        }
    };

    // Show success message
    const showSuccessMessage = (successElementId, duration = 3000) => {
        const element = document.getElementById(successElementId);
        if (element) {
            element.classList.add('show');
            setTimeout(() => {
                element.classList.remove('show');
            }, duration);
        }
    };

    // Save account settings
    const saveAccountSettings = (data) => {
        const settings = getSettings();
        settings.account = {
            email: data.email,
            phone: data.phone,
            language: data.language,
            currency: data.currency,
            updatedAt: new Date().toISOString()
        };
        saveSettings(settings);
        showSuccessMessage('accountSuccess');
        return true;
    };

    // Save security settings
    const saveSecuritySettings = (data) => {
        if (data.newPassword && data.newPassword !== data.confirmPassword) {
            alert('Passwords do not match!');
            return false;
        }
        
        const settings = getSettings();
        settings.security = {
            twoFactorAuth: data.twoFactorAuth,
            lastPasswordChange: new Date().toISOString()
        };
        saveSettings(settings);
        showSuccessMessage('securitySuccess');
        return true;
    };

    // Save notification settings
    const saveNotificationSettings = (data) => {
        const settings = getSettings();
        settings.notifications = {
            emailNotifications: data.emailNotifications,
            orderUpdates: data.orderUpdates,
            promotions: data.promotions,
            newArrivals: data.newArrivals,
            wishlistNotifications: data.wishlistNotifications,
            smsNotifications: data.smsNotifications,
            updatedAt: new Date().toISOString()
        };
        saveSettings(settings);
        showSuccessMessage('notificationsSuccess');
        return true;
    };

    // Save privacy settings
    const savePrivacySettings = (data) => {
        const settings = getSettings();
        settings.privacy = {
            profileVisibility: data.profileVisibility,
            shareActivity: data.shareActivity,
            allowMarketing: data.allowMarketing,
            dataTracking: data.dataTracking,
            updatedAt: new Date().toISOString()
        };
        saveSettings(settings);
        showSuccessMessage('privacySuccess');
        return true;
    };

    // Save user preferences
    const savePreferences = (data) => {
        const settings = getSettings();
        settings.preferences = {
            theme: data.theme,
            itemsPerPage: data.itemsPerPage,
            defaultSort: data.defaultSort,
            compactView: data.compactView,
            showReviews: data.showReviews,
            updatedAt: new Date().toISOString()
        };
        saveSettings(settings);
        showSuccessMessage('preferencesSuccess');
        return true;
    };

    // Load settings from localStorage
    const loadSettings = () => {
        const settings = getSettings();

        // Load account settings
        if (settings.account) {
            document.getElementById('email').value = settings.account.email || '';
            document.getElementById('phone').value = settings.account.phone || '';
            document.getElementById('language').value = settings.account.language || 'en';
            document.getElementById('currency').value = settings.account.currency || 'usd';
        }

        // Load notification settings
        if (settings.notifications) {
            document.getElementById('emailNotifications').checked = settings.notifications.emailNotifications !== false;
            document.getElementById('orderUpdates').checked = settings.notifications.orderUpdates !== false;
            document.getElementById('promotions').checked = settings.notifications.promotions !== false;
            document.getElementById('newArrivals').checked = settings.notifications.newArrivals !== false;
            document.getElementById('wishlistNotifications').checked = settings.notifications.wishlistNotifications === true;
            document.getElementById('smsNotifications').checked = settings.notifications.smsNotifications === true;
        }

        // Load privacy settings
        if (settings.privacy) {
            document.getElementById('profileVisibility').checked = settings.privacy.profileVisibility !== false;
            document.getElementById('shareActivity').checked = settings.privacy.shareActivity === true;
            document.getElementById('allowMarketing').checked = settings.privacy.allowMarketing === true;
            document.getElementById('dataTracking').checked = settings.privacy.dataTracking !== false;
        }

        // Load preferences
        if (settings.preferences) {
            document.getElementById('theme').value = settings.preferences.theme || 'light';
            document.getElementById('itemsPerPage').value = settings.preferences.itemsPerPage || '20';
            document.getElementById('defaultSort').value = settings.preferences.defaultSort || 'newest';
            document.getElementById('compactView').checked = settings.preferences.compactView === true;
            document.getElementById('showReviews').checked = settings.preferences.showReviews !== false;
        }
    };

    // Get all settings
    const getSettings = () => {
        const stored = localStorage.getItem(config.storageKey);
        return stored ? JSON.parse(stored) : {};
    };

    // Save settings
    const saveSettings = (settings) => {
        localStorage.setItem(config.storageKey, JSON.stringify(settings));
    };

    // Delete account
    const deleteAccount = () => {
        if (confirm('Are you sure? This action cannot be undone.')) {
            localStorage.removeItem(config.storageKey);
            localStorage.removeItem('userProfile');
            localStorage.removeItem('userAddresses');
            localStorage.removeItem('userOrders');
            // window.location.href = 'index.html';
            alert('Account deletion requested. Confirmation email sent.');
        }
    };

    // Download user data
    const downloadData = () => {
        const data = {
            settings: getSettings(),
            addresses: JSON.parse(localStorage.getItem('userAddresses')) || [],
            orders: JSON.parse(localStorage.getItem('userOrders')) || []
        };
        
        const dataStr = JSON.stringify(data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `user-data-${new Date().getTime()}.json`;
        link.click();
        URL.revokeObjectURL(url);
    };

    // Public API
    return {
        init,
        openSection,
        saveAccountSettings,
        saveSecuritySettings,
        saveNotificationSettings,
        savePrivacySettings,
        savePreferences,
        loadSettings,
        getSettings,
        deleteAccount,
        downloadData,
        showSuccessMessage
    };
})();

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    UserSettings.init();
});
