function selectFulfillment(label) {
    document.querySelectorAll('.fulfillment-option').forEach(el => el.classList.remove('selected'));
    label.classList.add('selected');
}

function normalizeStateInput(value) {
    if (!value) return '';
    var raw = value.trim();
    if (!raw) return '';
    if (raw.length <= 2) return raw.toUpperCase();
    return raw.slice(0, 2).toUpperCase();
}

document.addEventListener('DOMContentLoaded', function () {
    var stateInput = document.querySelector('input[name="deliveryState"]');
    var form = document.getElementById('checkout-form');
    if (!stateInput || !form) return;

    stateInput.addEventListener('blur', function () {
        stateInput.value = normalizeStateInput(stateInput.value);
    });

    form.addEventListener('submit', function () {
        stateInput.value = normalizeStateInput(stateInput.value);
    });
});
