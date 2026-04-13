function switchTab(event, tab) {
    document.querySelectorAll('.menu-tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('[id^="menu-"]').forEach(s => s.style.display = 'none');
    event.target.classList.add('active');
    document.getElementById('menu-' + tab).style.display = 'block';
}

function addToCart(name, price) {
    document.getElementById('cart-empty').style.display = 'none';
    document.getElementById('cart-items').style.display = 'block';
}

function toggleCart() {
    const empty = document.getElementById('cart-empty');
    const items = document.getElementById('cart-items');
    if (items.style.display === 'none') {
        empty.style.display = 'none';
        items.style.display = 'block';
    } else {
        empty.style.display = 'block';
        items.style.display = 'none';
    }
}
