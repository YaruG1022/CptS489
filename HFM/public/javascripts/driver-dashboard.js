const sectionFiles = {
    'current-order': 'driver-current-order.html',
    'history':       'driver-order-history.html',
    'earnings':      'driver-earnings.html'
};

function clearSection() {
    document.getElementById('section-content').innerHTML =
        '<div class="text-center py-5" style="color:#bbb;font-family:\'Poppins\',sans-serif;">' +
        '<div class="spinner-border" style="color:var(--golden-yellow-secondary);" role="status"></div>' +
        '<div class="mt-2" style="font-size:0.88rem;">Loadingâ€?/div></div>';
}

function setActiveTab(section) {
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    const tab = document.getElementById('tab-' + section);
    if (tab) tab.classList.add('active');
}

function showSection(section) {
    setActiveTab(section);
    clearSection();
    const file = sectionFiles[section];
    if (!file) return;
    fetch(file)
        .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.text(); })
        .then(html => {
            const container = document.getElementById('section-content');
            container.innerHTML = html;
            container.querySelectorAll('script').forEach(oldScript => {
                const s = document.createElement('script');
                s.textContent = oldScript.textContent;
                oldScript.parentNode.replaceChild(s, oldScript);
            });
        })
        .catch(err => {
            document.getElementById('section-content').innerHTML =
                '<div class="alert alert-danger">Could not load section: ' + err.message + '</div>';
        });
}

function toggleOnlineStatus(cb) {
    const dot  = document.getElementById('status-dot');
    const text = document.getElementById('status-text');
    if (cb.checked) {
        dot.classList.add('active');
        text.textContent = 'You are Online';
    } else {
        dot.classList.remove('active');
        text.textContent = 'You are Offline';
    }
}

document.addEventListener('DOMContentLoaded', () => showSection('current-order'));
