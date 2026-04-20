/* restaurant-detail.js — Add-to-cart interaction */

function addToCart(btn, menuItemId, restaurantId) {
    btn.disabled = true;

    fetch('/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ menuItemId: menuItemId, restaurantId: restaurantId })
    })
    .then(function (res) {
        if (res.status === 401) {
            window.location.href = '/login';
            return null;
        }
        return res.json();
    })
    .then(function (data) {
        if (!data) return;
        if (data.success) {
            /* Update cart badge */
            var badge = document.getElementById('cart-badge');
            if (badge) badge.textContent = data.cartCount;

            /* Visual feedback */
            var origHTML = btn.innerHTML;
            btn.innerHTML = '<i class="bi bi-check me-1"></i>Added!';
            btn.style.background = 'var(--sage-green-secondary)';
            setTimeout(function () {
                btn.innerHTML = origHTML;
                btn.style.background = '';
                btn.disabled = false;
            }, 1000);
        } else {
            btn.disabled = false;
            alert(data.error || 'Failed to add item.');
        }
    })
    .catch(function (err) {
        console.error('addToCart error:', err);
        btn.disabled = false;
    });
}
