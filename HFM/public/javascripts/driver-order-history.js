function toggleHistory(header) {
    const body    = header.nextElementSibling;
    const chevron = header.querySelector('.history-chevron');
    const isOpen  = body.classList.contains('open');
    body.classList.toggle('open', !isOpen);
    chevron.classList.toggle('rotated', !isOpen);
}
