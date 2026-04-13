const statusConfig = {
    'arrived':          { label: 'Status updated: Arrived at restaurant.', cls:'alert-info' },
    'picked-up':        { label: 'Status updated: Order picked up!', cls:'alert-warning' },
    'out-for-delivery': { label: 'Status updated: Out for delivery!', cls:'alert-warning' },
    'delivered':        { label: '🎉 Delivery complete! Great job.', cls:'alert-success' }
};

let _pendingStatus = null;

function requestConfirm(key, message) {
    // If already confirmed this status, do nothing
    if (document.getElementById('btn-' + key).classList.contains('active-status') && _pendingStatus === null) return;
    _pendingStatus = key;
    // Dim all buttons
    document.querySelectorAll('.status-action-btn').forEach(b => {
        if (b.id !== 'btn-issue') b.style.opacity = '0.45';
    });
    document.getElementById('btn-' + key).style.opacity = '1';
    document.getElementById('btn-' + key).style.borderColor = 'var(--golden-yellow-secondary)';
    // Show confirm bar
    const bar = document.getElementById('confirm-bar');
    document.getElementById('confirm-label').textContent = message;
    bar.style.display = 'flex';
}

function cancelConfirm() {
    if (!_pendingStatus) return;
    document.getElementById('btn-' + _pendingStatus).style.borderColor = '';
    document.querySelectorAll('.status-action-btn').forEach(b => b.style.opacity = '');
    document.getElementById('confirm-bar').style.display = 'none';
    _pendingStatus = null;
}

function confirmStatus() {
    if (!_pendingStatus) return;
    const key = _pendingStatus;
    _pendingStatus = null;
    document.getElementById('confirm-bar').style.display = 'none';
    document.querySelectorAll('.status-action-btn').forEach(b => { b.style.opacity = ''; b.style.borderColor = ''; });
    updateStatus(key);
}

/* REPORT AN ISSUE JS (commented out)
function toggleIssueForm() {
    const form = document.getElementById('issue-form');
    const btn  = document.getElementById('btn-issue');
    const isOpen = form.style.display !== 'none';
    form.style.display = isOpen ? 'none' : 'block';
    btn.classList.toggle('active-status', !isOpen);
    if (isOpen) {
        document.getElementById('issue-text').value = '';
        document.getElementById('issue-text-error').style.display = 'none';
    }
}

function submitIssue() {
    const text  = document.getElementById('issue-text').value.trim();
    const errEl = document.getElementById('issue-text-error');
    if (!text) {
        errEl.style.display = 'block';
        return;
    }
    errEl.style.display = 'none';
    document.getElementById('issue-form').style.display = 'none';
    document.getElementById('btn-issue').classList.add('active-status');
    const toast = document.getElementById('status-toast');
    toast.className = 'mt-3 alert py-2 alert-danger';
    toast.textContent = 'Issue reported: "' + escapeHtml(text) + '". Support has been notified.';
    toast.classList.remove('d-none');
    setTimeout(() => toast.classList.add('d-none'), 6000);
}
*/

function updateStatus(key) {
    // Highlight selected button
    document.querySelectorAll('.status-action-btn').forEach(b => b.classList.remove('active-status'));
    const btn = document.getElementById('btn-' + key);
    if (btn) btn.classList.add('active-status');

    // Advance progress steps
    const steps = ['picked-up', 'out-for-delivery', 'delivered'];
    const idx   = steps.indexOf(key);
    steps.forEach((s, i) => {
        const el = document.getElementById('step-' + s);
        if (!el) return;
        el.classList.remove('done', 'active');
        if (i < idx)       el.classList.add('done');
        else if (i === idx) el.classList.add('active');
    });

    // Toast
    const cfg   = statusConfig[key] || { label: 'Status updated.', cls: 'alert-secondary' };
    const toast = document.getElementById('status-toast');
    toast.className = 'mt-3 alert py-2 ' + cfg.cls;
    toast.textContent = cfg.label;
    setTimeout(() => toast.classList.add('d-none'), 4000);
}

function sendChat() {
    const input = document.getElementById('chat-input');
    const msg   = input.value.trim();
    if (!msg) return;
    const box = document.getElementById('chat-box');
    box.innerHTML +=
        '<div class="chat-msg me">' +
        '  <div class="chat-sender" style="text-align:right;">You</div>' +
        '  <div class="bubble">' + escapeHtml(msg) + '</div>' +
        '</div>';
    input.value = '';
    box.scrollTop = box.scrollHeight;
}

function escapeHtml(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
