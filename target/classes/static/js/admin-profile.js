// Check admin authentication
const admin = checkAdmin();

if (admin) {
    document.getElementById('adminName').textContent = admin.fullName || admin.username;
    loadAdminProfile();
}

function checkAdmin() {
    const admin = localStorage.getItem('admin');
    if (!admin) {
        window.location.href = 'admin-login.html';
        return null;
    }
    try {
        const adminData = JSON.parse(admin);
        if (adminData.role === 'ADMIN' || adminData.username === 'admin') {
            return adminData;
        }
        alert('Access denied. Admin privileges required.');
        window.location.href = 'admin-login.html';
        return null;
    } catch (e) {
        console.error('Invalid admin data:', e);
        window.location.href = 'admin-login.html';
        return null;
    }
}

function loadAdminProfile() {
    if (admin) {
        // Populate Account Information Tab
        document.getElementById('profileFullName').textContent = admin.fullName || 'Administrator';
        document.getElementById('profileRole').textContent = admin.role || 'Admin Role';
        document.getElementById('fullName').value = admin.fullName || '';
        document.getElementById('email').value = admin.email || '';
        document.getElementById('phone').value = admin.phone || '';
        document.getElementById('username').value = admin.username || '';
        document.getElementById('role').value = admin.role || 'ADMIN';
        document.getElementById('company').value = admin.company || '';
        document.getElementById('department').value = admin.department || '';

        // Set timestamps
        const now = new Date().toLocaleString();
        document.getElementById('createdAt').value = admin.createdAt || 'N/A';
        document.getElementById('updatedAt').value = now;
    }
}

function switchProfileTab(tabName, event) {
    event.preventDefault();

    // Hide all tabs
    document.querySelectorAll('.profile-tab-content').forEach(el => {
        el.classList.remove('active');
    });

    // Show selected tab
    document.getElementById(tabName + 'Tab').classList.add('active');

    // Update tab buttons
    document.querySelectorAll('.profile-tab').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.closest('.profile-tab').classList.add('active');
}

function saveProfile() {
    const updatedAdmin = {
        ...admin,
        fullName: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        company: document.getElementById('company').value,
        department: document.getElementById('department').value
    };

    // Save to localStorage
    localStorage.setItem('admin', JSON.stringify(updatedAdmin));

    alert('Profile updated successfully!');
    document.getElementById('profileFullName').textContent = updatedAdmin.fullName || 'Administrator';
}

function resetProfile() {
    loadAdminProfile();
    alert('Profile changes discarded.');
}

function changePassword() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (!currentPassword || !newPassword || !confirmPassword) {
        alert('Please fill in all password fields.');
        return;
    }

    if (newPassword.length < 8) {
        alert('Password must be at least 8 characters long.');
        return;
    }

    if (newPassword !== confirmPassword) {
        alert('New passwords do not match.');
        return;
    }

    // In a real application, you would verify the current password
    // and update it through an API call
    alert('Password changed successfully!');
    resetPassword();
}

function resetPassword() {
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
}

let tfaEnabled = false;

function toggleTFA() {
    tfaEnabled = !tfaEnabled;
    const tfaBtn = document.getElementById('tfaBtn');
    const tfaStatus = document.getElementById('tfaStatus');

    if (tfaEnabled) {
        tfaStatus.textContent = '● Enabled';
        tfaStatus.classList.remove('inactive');
        tfaStatus.classList.add('active');
        tfaBtn.textContent = 'Disable 2FA';
        alert('Two-Factor Authentication has been enabled. Download an authenticator app and scan the QR code.');
    } else {
        tfaStatus.textContent = '● Disabled';
        tfaStatus.classList.remove('active');
        tfaStatus.classList.add('inactive');
        tfaBtn.textContent = 'Enable 2FA';
        alert('Two-Factor Authentication has been disabled.');
    }
}

function filterActivity() {
    const dateFilter = document.getElementById('activityDate').value;
    const typeFilter = document.getElementById('activityType').value;

    console.log('Filtering activities by date:', dateFilter, 'and type:', typeFilter);
    // In a real application, you would filter the activity log
    // based on the selected date and type
}

function adminLogout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('admin');
        window.location.href = 'admin-login.html';
    }
}
