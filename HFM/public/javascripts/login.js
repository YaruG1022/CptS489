function togglePassword(id, btn) {
    const input = document.getElementById(id);
    const icon = btn.querySelector('i');
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'bi bi-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'bi bi-eye';
    }
}

function validateLogin() {
    // Mockup: accept any non-empty email/password and navigate
    const email = document.getElementById('login-email').value.trim();
    const pass  = document.getElementById('login-password').value;
    if (!email || !pass) {
        document.getElementById('login-error').style.display = 'block';
        return false;
    }
    return true; // proceeds to customer-dashboard.html via form action
}
