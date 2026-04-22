const sectionFiles = {
    'current-orders':   '/merchant-current-orders',
    'completed-orders': '/merchant-completed-orders',
    'my-menu':          '/merchant-my-menu'
};

var activeSection = null;
var currentOrdersRefreshTimer = null;
var myMenuRefreshTimer = null;

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

function runEmbeddedScripts(container) {
    container.querySelectorAll('script').forEach(function(oldScript) {
        var newScript = document.createElement('script');
        newScript.textContent = oldScript.textContent;
        oldScript.parentNode.replaceChild(newScript, oldScript);
    });
}

function stopMyMenuAutoRefresh() {
    if (myMenuRefreshTimer) {
        clearInterval(myMenuRefreshTimer);
        myMenuRefreshTimer = null;
    }
}

function stopCurrentOrdersAutoRefresh() {
    if (currentOrdersRefreshTimer) {
        clearInterval(currentOrdersRefreshTimer);
        currentOrdersRefreshTimer = null;
    }
}

function startCurrentOrdersAutoRefresh() {
    stopCurrentOrdersAutoRefresh();
    if (activeSection !== 'current-orders') return;

    currentOrdersRefreshTimer = setInterval(function () {
        if (activeSection !== 'current-orders') return;

        fetch(sectionFiles['current-orders'])
            .then(function (r) {
                if (!r.ok) throw new Error('HTTP ' + r.status);
                return r.text();
            })
            .then(function (html) {
                if (activeSection !== 'current-orders') return;
                var container = document.getElementById('section-content');
                container.innerHTML = html;
                runEmbeddedScripts(container);
            })
            .catch(function () {
                // Keep UI stable on background refresh failures.
            });
    }, 2000);
}

function startMyMenuAutoRefresh() {
    stopMyMenuAutoRefresh();
    if (activeSection !== 'my-menu') return;

    myMenuRefreshTimer = setInterval(function () {
        if (activeSection !== 'my-menu') return;
        var modal = document.getElementById('menuItemModal');
        if (modal && modal.classList.contains('show')) return;

        fetch(sectionFiles['my-menu'])
            .then(function (r) {
                if (!r.ok) throw new Error('HTTP ' + r.status);
                return r.text();
            })
            .then(function (html) {
                if (activeSection !== 'my-menu') return;
                var container = document.getElementById('section-content');
                container.innerHTML = html;
                runEmbeddedScripts(container);
            })
            .catch(function () {
                // Keep UI stable on background refresh failures.
            });
    }, 5000);
}

function showSection(section) {
    activeSection = section;
    stopCurrentOrdersAutoRefresh();
    stopMyMenuAutoRefresh();
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
            runEmbeddedScripts(container);
            if (section === 'current-orders') startCurrentOrdersAutoRefresh();
            if (section === 'my-menu') startMyMenuAutoRefresh();
        })
        .catch(function(err) {
            document.getElementById('section-content').innerHTML =
                '<div class="alert alert-danger">Could not load section: ' + err.message + '</div>';
        });
}

document.addEventListener('DOMContentLoaded', function() {
    showSection('current-orders');
});

window.addEventListener('beforeunload', function () {
    stopCurrentOrdersAutoRefresh();
    stopMyMenuAutoRefresh();
});
