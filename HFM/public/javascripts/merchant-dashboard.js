const sectionFiles = {
    'current-orders': 'merchant-current-orders.html',
    'all-orders':     'merchant-all-orders.html',
    'my-menu':        '/merchant-my-menu'
};

function clearSection() {
    document.getElementById('section-content').innerHTML =
        '<div class="text-center py-5" style="color:#bbb;font-family:\'Poppins\',sans-serif;">' +
        '<div class="spinner-border" style="color:var(--burnt-orange-primary);" role="status"></div>' +
        '<div class="mt-2" style="font-size:0.88rem;">Loading...</div></div>';
}

function setActiveTab(section) {
    document.querySelectorAll('.tab-btn').forEach(function(el) { el.classList.remove('active'); });
    var tab = document.getElementById('tab-' + section);
    if (tab) tab.classList.add('active');
}

function showSection(section) {
    setActiveTab(section);
    clearSection();
    var file = sectionFiles[section];
    if (!file) return;
    fetch(file)
        .then(function(r) {
            if (!r.ok) throw new Error('HTTP ' + r.status);
            return r.text();
        })
        .then(function(html) {
            var container = document.getElementById('section-content');
            container.innerHTML = html;
            container.querySelectorAll('script').forEach(function(oldScript) {
                var newScript = document.createElement('script');
                newScript.textContent = oldScript.textContent;
                oldScript.parentNode.replaceChild(newScript, oldScript);
            });
        })
        .catch(function(err) {
            document.getElementById('section-content').innerHTML =
                '<div class="alert alert-danger">Could not load section: ' + err.message + '</div>';
        });
}

document.addEventListener('DOMContentLoaded', function() {
    showSection('current-orders');
});
