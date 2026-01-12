const API_BASE_URL = 'http://localhost:8080';

function logout() {
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

function checkAuth() {
    const user = localStorage.getItem('user');
    if (!user) {
        window.location.href = 'login.html';
        return null;
    }
    return JSON.parse(user);
}