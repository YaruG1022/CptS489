const sectionFiles = {
    'order-status': 'customer-order-status.html',
    'history':      'customer-order-history.html'
};

function clearSection() {
    document.getElementById('section-content').innerHTML =
        '<div class="text-center py-5" style="color:#bbb;font-family:\'Poppins\',sans-serif;">' +
        '<div class="spinner-border" style="color:var(--burnt-orange-primary);" role="status"></div>' +
        '<div class="mt-2" style="font-size:0.88rem;">Loading�?/div></div>';
}

function setActiveTab(section) {
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.sidebar-nav-link').forEach(el => el.classList.remove('active'));
    const tab = document.getElementById('tab-' + section);
    if (tab) tab.classList.add('active');
}

function showSection(section) {
    setActiveTab(section);
    clearSection();
    const file = sectionFiles[section];
    if (!file) return;
    fetch(file)
        .then(r => {
            if (!r.ok) throw new Error('HTTP ' + r.status);
            return r.text();
        })
        .then(html => {
            const container = document.getElementById('section-content');
            container.innerHTML = html;
            // Execute any <script> tags injected with innerHTML
            container.querySelectorAll('script').forEach(oldScript => {
                const newScript = document.createElement('script');
                newScript.textContent = oldScript.textContent;
                oldScript.parentNode.replaceChild(newScript, oldScript);
            });
        })
        .catch(err => {
            document.getElementById('section-content').innerHTML =
                '<div class="alert alert-danger">Could not load section: ' + err.message + '</div>';
        });
}

document.addEventListener('DOMContentLoaded', () => showSection('order-status'));
