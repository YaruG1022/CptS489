function toggleHistory(header) {
    const body = header.nextElementSibling;
    const isOpen = body.classList.contains('open');
    // close all
    document.querySelectorAll('.history-item-body.open').forEach(el => el.classList.remove('open'));
    document.querySelectorAll('.history-item-header.open').forEach(el => el.classList.remove('open'));
    // open clicked if it was closed
    if (!isOpen) {
        body.classList.add('open');
        header.classList.add('open');
    }
}
