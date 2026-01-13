/**
 * User Profile JavaScript
 * Handles profile management, form editing, and profile picture upload
 * Author: Frontend Developer 1 (Person 7)
 */

let isEditMode = false;

/**
 * Load user profile on page load
 */
document.addEventListener('DOMContentLoaded', function() {
    loadUserProfile();
    setupEventListeners();
});

/**
 * Load user profile data from API
 */
function loadUserProfile() {
    try {
        const token = localStorage.getItem('authToken');
        if (!token) {
            window.location.href = '/pages/login.html';
            return;
        }

        // Mock profile data - replace with actual API call
        const userData = {
            id: 1,
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            phone: '+1 (555) 123-4567',
            dob: '1990-05-15',
            gender: 'Male',
            bio: 'I love shopping for quality products and excellent customer service!',
            profilePicture: 'https://via.placeholder.com/150',
            totalOrders: 12,
            totalSpent: 2500,
            loyaltyPoints: 1250,
            memberSince: 'March 2023'
        };

        populateProfileForm(userData);
        updateProfileStats(userData);
    } catch (error) {
        console.error('Error loading profile:', error);
        showError('Failed to load profile data');
    }
}

/**
 * Populate form with user data
 */
function populateProfileForm(userData) {
    document.getElementById('firstName').value = userData.firstName;
    document.getElementById('lastName').value = userData.lastName;
    document.getElementById('email').value = userData.email;
    document.getElementById('phone').value = userData.phone;
    document.getElementById('dob').value = userData.dob;
    document.getElementById('gender').value = userData.gender;
    document.getElementById('bio').value = userData.bio;
    document.getElementById('profilePicture').src = userData.profilePicture;
    document.getElementById('displayName').textContent = userData.firstName + ' ' + userData.lastName;
    document.getElementById('displayEmail').textContent = userData.email;
}

/**
 * Update profile stats
 */
function updateProfileStats(userData) {
    document.getElementById('totalOrders').textContent = userData.totalOrders;
    document.getElementById('totalSpent').textContent = '$' + (userData.totalSpent / 1000).toFixed(1) + 'K';
    document.getElementById('loyaltyPoints').textContent = userData.loyaltyPoints;
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    const bioField = document.getElementById('bio');
    const charCount = document.getElementById('charCount');

    bioField.addEventListener('input', function() {
        charCount.textContent = this.value.length;
    });

    // Initialize char count
    charCount.textContent = bioField.value.length;
}

/**
 * Toggle edit mode
 */
function toggleEditMode() {
    isEditMode = !isEditMode;
    const formFields = document.querySelectorAll('#profileForm input, #profileForm select, #profileForm textarea');
    const formActions = document.getElementById('formActions');
    const editBtn = document.querySelector('.edit-btn');

    formFields.forEach(field => {
        field.disabled = !isEditMode;
    });

    if (isEditMode) {
        formActions.classList.remove('hidden');
        editBtn.innerHTML = '<i class="fas fa-times"></i> Cancel';
    } else {
        formActions.classList.add('hidden');
        editBtn.innerHTML = '<i class="fas fa-edit"></i> Edit';
    }
}

/**
 * Cancel edit mode
 */
function cancelEdit() {
    isEditMode = false;
    toggleEditMode();
    loadUserProfile(); // Reload original data
    showSuccess('Changes cancelled');
}

/**
 * Save profile changes
 */
function saveProfile(event) {
    event.preventDefault();

    // Validate form
    if (!validateProfileForm()) {
        return;
    }

    const formData = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        dob: document.getElementById('dob').value,
        gender: document.getElementById('gender').value,
        bio: document.getElementById('bio').value
    };

    try {
        // Mock API call - replace with actual API
        console.log('Saving profile:', formData);

        // Simulate API call
        setTimeout(() => {
            isEditMode = false;
            toggleEditMode();
            document.getElementById('displayName').textContent = formData.firstName + ' ' + formData.lastName;
            document.getElementById('displayEmail').textContent = formData.email;
            showSuccess('Profile updated successfully');
        }, 1000);

    } catch (error) {
        console.error('Error saving profile:', error);
        showError('Failed to save profile');
    }
}

/**
 * Validate profile form
 */
function validateProfileForm() {
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();

    if (!firstName || firstName.length < 2) {
        showError('First name must be at least 2 characters');
        return false;
    }

    if (!lastName || lastName.length < 2) {
        showError('Last name must be at least 2 characters');
        return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showError('Invalid email address');
        return false;
    }

    const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
    if (!phoneRegex.test(phone)) {
        showError('Invalid phone number');
        return false;
    }

    return true;
}

/**
 * Trigger file input for profile picture
 */
function triggerFileInput() {
    if (isEditMode) {
        document.getElementById('profilePictureInput').click();
    } else {
        showError('Click Edit to change your profile picture');
    }
}

/**
 * Handle profile picture upload
 */
function handleProfilePictureUpload(event) {
    const file = event.target.files[0];

    if (!file) return;

    // Validate file
    if (!validateImageFile(file)) {
        return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById('profilePicture').src = e.target.result;

        // Upload to server
        uploadProfilePicture(file);
    };
    reader.readAsDataURL(file);
}

/**
 * Validate image file
 */
function validateImageFile(file) {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
        showError('Invalid file type. Please use JPG, PNG, GIF, or WebP');
        return false;
    }

    if (file.size > maxSize) {
        showError('File size too large. Maximum 5MB allowed');
        return false;
    }

    return true;
}

/**
 * Upload profile picture to server
 */
function uploadProfilePicture(file) {
    const formData = new FormData();
    formData.append('file', file);

    try {
        const token = localStorage.getItem('authToken');

        // Mock API call - replace with actual API
        console.log('Uploading profile picture:', file.name);

        // Simulate upload
        setTimeout(() => {
            showSuccess('Profile picture updated successfully');
        }, 500);

    } catch (error) {
        console.error('Error uploading profile picture:', error);
        showError('Failed to upload profile picture');
    }
}

/**
 * Delete profile picture
 */
function deleteProfilePicture() {
    if (confirm('Are you sure you want to delete your profile picture?')) {
        try {
            // Mock API call
            document.getElementById('profilePicture').src = 'https://via.placeholder.com/150';
            showSuccess('Profile picture removed');
        } catch (error) {
            console.error('Error deleting profile picture:', error);
            showError('Failed to delete profile picture');
        }
    }
}

/**
 * Navigation functions
 */
function goToOrders() {
    window.location.href = 'my-orders.html';
}

function goToAddresses() {
    window.location.href = 'addresses.html';
}

function goToWishlist() {
    window.location.href = 'wishlist.html';
}

function goToSettings() {
    window.location.href = 'account-settings.html';
}

/**
 * Show success message
 */
function showSuccess(message) {
    const notification = document.createElement('div');
    notification.className = 'notification success';
    notification.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #06d6a0;
        color: white;
        padding: 15px 20px;
        border-radius: 6px;
        box-shadow: 0 10px 25px rgba(6, 214, 160, 0.3);
        z-index: 9999;
        animation: slideIn 0.3s ease;
        display: flex;
        align-items: center;
        gap: 10px;
    `;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

/**
 * Show error message
 */
function showError(message) {
    const notification = document.createElement('div');
    notification.className = 'notification error';
    notification.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>${message}</span>
    `;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #ef476f;
        color: white;
        padding: 15px 20px;
        border-radius: 6px;
        box-shadow: 0 10px 25px rgba(239, 71, 111, 0.3);
        z-index: 9999;
        animation: slideIn 0.3s ease;
        display: flex;
        align-items: center;
        gap: 10px;
    `;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

/**
 * Add animation styles
 */
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
