/* cart.js — Cart page interactions */

function updateQty(itemId, delta) {
    var qtyEl = document.getElementById('qty-' + itemId);
    var currentQty = parseInt(qtyEl.textContent);
    var newQty = currentQty + delta;

    if (newQty <= 0) {
        removeItem(itemId);
        return;
    }

    fetch('/cart/item/' + itemId, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQty })
    })
    .then(function (res) { return res.json(); })
    .then(function (data) {
        if (data.success) {
            qtyEl.textContent = newQty;
            var itemEl = document.getElementById('cart-item-' + itemId);
            var unitPrice = parseFloat(itemEl.dataset.price);
            document.getElementById('price-' + itemId).textContent =
                '$' + (unitPrice * newQty).toFixed(2);
        }
    })
    .catch(function (err) { console.error('updateQty error:', err); });
}

function removeItem(itemId) {
    fetch('/cart/item/' + itemId, {
        method: 'DELETE'
    })
    .then(function (res) { return res.json(); })
    .then(function (data) {
        if (data.success) {
            var itemEl = document.getElementById('cart-item-' + itemId);
            if (itemEl) itemEl.remove();

            /* If any order group is now empty, reload to refresh the page */
            var groups = document.querySelectorAll('[id^="order-group-"]');
            var anyEmpty = false;
            groups.forEach(function (g) {
                if (g.querySelectorAll('.cart-page-item').length === 0) anyEmpty = true;
            });
            if (anyEmpty) window.location.reload();
        }
    })
    .catch(function (err) { console.error('removeItem error:', err); });
}
