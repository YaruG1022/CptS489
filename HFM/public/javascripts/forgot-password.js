function submitReset(e) {
    e.preventDefault();
    const emailEl = document.getElementById('reset-email');
    const errEl   = document.getElementById('reset-error');
    const email   = emailEl.value.trim();

    errEl.style.display = 'none';

    if (!email) {
        errEl.style.display = 'block';
        return false;
    }

    // Mock: disable button briefly to simulate sending
    const btn = document.getElementById('reset-btn');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status"></span>Sendingâ€?;

    setTimeout(() => {
        document.getElementById('sent-email-display').textContent = email;
        document.getElementById('reset-form-panel').style.display = 'none';
        document.getElementById('back-to-login-footer').style.display = 'none';
        document.getElementById('success-panel').style.display = 'block';
    }, 1200);

    return false;
}

function resendLink() {
    const emailEl = document.getElementById('sent-email-display');
    const resendEl = document.querySelector('.resend-row');
    resendEl.innerHTML = '<i class="bi bi-check-circle-fill me-1" style="color:var(--sage-green-secondary);"></i>'
        + '<span style="color:var(--sage-green-secondary);font-family:\'Open Sans\',sans-serif;font-size:0.83rem;">Reset link resent!</span>';
}
