const orderData = {
    maria: { restaurant: "Grandma Maria's Kitchen", items: "Grandma's Lasagna, Thai Green Curry, Honey Lemon Tart · Mar 2, 2026" },
    priya: { restaurant: "Spice Route by Priya",    items: "Chicken Tikka Masala, Garlic Naan · Feb 24, 2026" },
    jin:   { restaurant: "Seoul Bowl by Jin",        items: "Bibimbap Bowl · Feb 17, 2026" }
};
function updateOrderPreview(sel) {
    const preview = document.getElementById('orderPreview');
    if (!sel.value) { preview.style.display = 'none'; return; }
    const d = orderData[sel.value];
    document.getElementById('previewRestaurant').textContent = d.restaurant;
    document.getElementById('previewItems').textContent = d.items;
    preview.style.display = 'block';
}
