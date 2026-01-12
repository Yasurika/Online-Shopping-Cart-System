document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        console.log('[AUTH] Attempting login for user:', username);
        
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        console.log('[AUTH] Login response:', data);

        if (data.success) {
            console.log('[AUTH] Login successful, saving user data');
            localStorage.setItem('user', JSON.stringify(data.data));
            
            // Redirect to customer dashboard after successful login
            console.log('[AUTH] Redirecting to customer dashboard');
            window.location.href = 'customer-dashboard.html';
        } else {
            console.error('[AUTH] Login failed:', data.message);
            alert('Error: ' + data.message);
        }
    } catch (error) {
        console.error('[AUTH] Login error:', error);
        alert('Login failed. Please try again.');
    }
});

// Register Form
document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = {
        username: document.getElementById('username').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        fullName: document.getElementById('fullName').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value
    };

    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (data.success) {
            alert('Registration successful! Please login.');
            window.location.href = 'login.html';
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        alert('Registration failed. Please try again.');
        console.error('Error:', error);
    }
});