function selectFulfillment(label) {
    document.querySelectorAll('.fulfillment-option').forEach(el => el.classList.remove('selected'));
    label.classList.add('selected');
}
