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

function selectRole(selectedId) {
    ['card-customer', 'card-cook', 'card-driver'].forEach(id => {
        document.getElementById(id).classList.toggle('selected', id === selectedId);
    });
    // Check the radio inside the selected card
    document.querySelector('#' + selectedId + ' input[type="radio"]').checked = true;

    // Route to correct dashboard on submit
    const destinations = {
        'card-customer': 'customer-dashboard.html',
        'card-cook':     'customer-dashboard.html',
        'card-driver':   'driver-dashboard.html'
    };
    document.getElementById('register-form').action = destinations[selectedId];
}

function updateStrength(val) {
    let score = 0;
    if (val.length >= 8)           score++;
    if (/[A-Z]/.test(val))         score++;
    if (/[0-9]/.test(val))         score++;
    if (/[^A-Za-z0-9]/.test(val))  score++;

    const colors  = ['#e0e0e0', '#e85d04', '#f4a261', '#7a9b6e', '#2e7d32'];
    const labels  = ['', 'Weak', 'Fair', 'Good', 'Strong'];
    const txtClrs = ['#bbb', '#dc3545', '#fd7e14', '#7a9b6e', '#2e7d32'];

    for (let i = 1; i <= 4; i++) {
        document.getElementById('s' + i).style.background = i <= score ? colors[score] : '#e8e8e8';
    }
    const txt = document.getElementById('strength-text');
    txt.textContent = val.length ? labels[score] || 'Enter a password' : 'Enter a password';
    txt.style.color = txtClrs[score] || '#bbb';
}

function validateRegister() {
    const errEl = document.getElementById('reg-error');
    const pass    = document.getElementById('reg-password').value;
    const confirm = document.getElementById('reg-confirm').value;

    document.getElementById('confirm-error').style.display = 'none';
    errEl.style.display = 'none';

    if (pass !== confirm) {
        document.getElementById('confirm-error').style.display = 'block';
        return false;
    }
    if (pass.length < 8) {
        errEl.textContent = 'Password must be at least 8 characters.';
        errEl.style.display = 'block';
        return false;
    }
    return true; // proceeds to customer-dashboard.html
}
