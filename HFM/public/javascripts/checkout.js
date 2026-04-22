function selectFulfillment(label) {
    document.querySelectorAll('.fulfillment-option').forEach(el => el.classList.remove('selected'));
    label.classList.add('selected');

    // Keep parity: both pickup and delivery must provide the same address/contact fields.
    enforceSharedAddressRequirements();
}

function enforceSharedAddressRequirements() {
    var requiredFields = [
        'deliveryFirstName',
        'deliveryLastName',
        'deliveryStreet',
        'deliveryCity',
        'deliveryState',
        'deliveryZip',
        'deliveryPhone'
    ];

    requiredFields.forEach(function (name) {
        var field = document.querySelector('input[name="' + name + '"]');
        if (field) field.required = true;
    });
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

    enforceSharedAddressRequirements();

    stateInput.addEventListener('blur', function () {
        stateInput.value = normalizeStateInput(stateInput.value);
    });

    form.addEventListener('submit', function () {
        stateInput.value = normalizeStateInput(stateInput.value);
    });
});
