var profile = window.__PROFILE_DATA__ || {};

function safe(v) {
    return (v === null || v === undefined || v === '') ? 'Not set' : String(v);
}

function initials(firstName, lastName) {
    var f = (firstName || '').trim();
    var l = (lastName || '').trim();
    return ((f[0] || '') + (l[0] || '')).toUpperCase() || 'U';
}

function showError(message) {
    var el = document.getElementById('profile-error');
    if (!el) return;
    if (!message) {
        el.style.display = 'none';
        el.textContent = '';
        return;
    }
    el.textContent = message;
    el.style.display = 'block';
}

function formatDob(dob) {
    if (!dob) return 'Not set';
    var d = new Date(dob);
    if (isNaN(d.getTime())) return 'Not set';
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function renderProfile() {
    document.getElementById('avatar-initials').textContent = initials(profile.firstName, profile.lastName);
    var fullName = ((profile.firstName || '') + ' ' + (profile.lastName || '')).trim();
    document.getElementById('header-name').textContent = fullName || 'My Profile';

    document.getElementById('vw-first').textContent = safe(profile.firstName);
    document.getElementById('vw-last').textContent = safe(profile.lastName);
    document.getElementById('vw-email').textContent = safe(profile.email);
    document.getElementById('vw-phone').textContent = safe(profile.phone);
    document.getElementById('vw-dob').textContent = formatDob(profile.dateOfBirth);

    document.getElementById('vw-street').textContent = safe(profile.street);
    document.getElementById('vw-suite').textContent = safe(profile.suite);
    document.getElementById('vw-city').textContent = safe(profile.city);
    document.getElementById('vw-state').textContent = safe(profile.state);
    document.getElementById('vw-zip').textContent = safe(profile.zip);

    document.getElementById('ed-first').value = profile.firstName || '';
    document.getElementById('ed-last').value = profile.lastName || '';
    document.getElementById('ed-phone').value = profile.phone || '';
    document.getElementById('ed-dob').value = profile.dateOfBirth || '';

    document.getElementById('ed-street').value = profile.street || '';
    document.getElementById('ed-suite').value = profile.suite || '';
    document.getElementById('ed-city').value = profile.city || '';
    document.getElementById('ed-state').value = profile.state || '';
    document.getElementById('ed-zip').value = profile.zip || '';
}

function enterEditMode() {
    showError('');
    document.getElementById('view-mode').style.display = 'none';
    document.getElementById('edit-mode').style.display = 'block';
    document.getElementById('btn-edit').style.display = 'none';
}

function cancelEdit() {
    showError('');
    document.getElementById('view-mode').style.display = '';
    document.getElementById('edit-mode').style.display = 'none';
    document.getElementById('btn-edit').style.display = '';
    renderProfile();
}

function toggleAddrEdit(show) {
    showError('');
    document.getElementById('view-addr').style.display = show ? 'none' : '';
    document.getElementById('edit-addr').style.display = show ? 'block' : 'none';
    if (!show) renderProfile();
}

async function saveChanges() {
    showError('');
    var payload = {
        firstName: document.getElementById('ed-first').value,
        lastName: document.getElementById('ed-last').value,
        phone: document.getElementById('ed-phone').value,
        dateOfBirth: document.getElementById('ed-dob').value
    };

    var resp = await fetch('/profile/personal', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    var data = await resp.json().catch(function () { return {}; });
    if (!resp.ok) {
        showError(data.error || 'Unable to save personal information.');
        return;
    }

    profile = data.profile || profile;
    cancelEdit();
    showToast();
}

async function saveAddr() {
    showError('');
    var payload = {
        street: document.getElementById('ed-street').value,
        suite: document.getElementById('ed-suite').value,
        city: document.getElementById('ed-city').value,
        state: document.getElementById('ed-state').value,
        zip: document.getElementById('ed-zip').value
    };

    var resp = await fetch('/profile/address', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    var data = await resp.json().catch(function () { return {}; });
    if (!resp.ok) {
        showError(data.error || 'Unable to save address.');
        return;
    }

    profile = data.profile || profile;
    toggleAddrEdit(false);
    showToast();
}

function showToast() {
    var t = document.getElementById('save-toast');
    t.style.display = 'block';
    setTimeout(function () { t.style.display = 'none'; }, 2800);
}

document.addEventListener('DOMContentLoaded', function () {
    renderProfile();
});
