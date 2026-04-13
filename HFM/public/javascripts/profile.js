// ── Payment method ─────────────────────────────────
function togglePaymentForm() {
    const form = document.getElementById('add-payment-form');
    const btn  = document.getElementById('btn-add-payment');
    const open = form.style.display !== 'none';
    form.style.display = open ? 'none' : 'block';
    btn.innerHTML = open
        ? '<i class="bi bi-plus me-1"></i>Add Payment Method'
        : '<i class="bi bi-dash me-1"></i>Cancel';
}
function cancelPayment() {
    document.getElementById('add-payment-form').style.display = 'none';
    document.getElementById('btn-add-payment').innerHTML = '<i class="bi bi-plus me-1"></i>Add Payment Method';
}
function savePayment() {
    cancelPayment();
    showToast();
}

// ── Edit / view toggle ──────────────────────────────
function enterEditMode() {
    document.getElementById('view-mode').style.display = 'none';
    document.getElementById('edit-mode').style.display = 'block';
    document.getElementById('btn-edit').style.display = 'none';
}
function cancelEdit() {
    document.getElementById('view-mode').style.display = '';
    document.getElementById('edit-mode').style.display = 'none';
    document.getElementById('btn-edit').style.display = '';
}
function saveChanges() {
    cancelEdit();
    showToast();
}

// ── Address edit ────────────────────────────────────
function toggleAddrEdit(show) {
    document.getElementById('view-addr').style.display = show ? 'none' : '';
    document.getElementById('edit-addr').style.display = show ? 'block' : 'none';
}
function saveAddr() {
    toggleAddrEdit(false);
    showToast();
}

// ── Password accordion ──────────────────────────────
function togglePwd() {
    const body    = document.getElementById('pwd-body');
    const chevron = document.getElementById('pwd-chevron');
    const open    = body.style.display !== 'none';
    body.style.display    = open ? 'none' : 'block';
    chevron.className = open ? 'bi bi-chevron-down' : 'bi bi-chevron-up';
}
function changePassword() {
    const errEl   = document.getElementById('pwd-error');
    const current = document.getElementById('pwd-current').value;
    const newPwd  = document.getElementById('pwd-new').value;
    const confirm = document.getElementById('pwd-confirm').value;
    errEl.style.display = 'none';
    if (!current) { errEl.textContent = 'Please enter your current password.'; errEl.style.display='block'; return; }
    if (newPwd.length < 8) { errEl.textContent = 'New password must be at least 8 characters.'; errEl.style.display='block'; return; }
    if (newPwd !== confirm) { errEl.textContent = 'Passwords do not match.'; errEl.style.display='block'; return; }
    showToast();
    togglePwd();
}

// ── Delete modal ────────────────────────────────────
function confirmDelete() {
    const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
    modal.show();
}

// ── Toast ───────────────────────────────────────────
function showToast() {
    const t = document.getElementById('save-toast');
    t.style.display = 'block';
    setTimeout(() => { t.style.display = 'none'; }, 2800);
}
