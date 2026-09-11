/* Kiosk home screen: informational sheets for the menu rows. */
(() => {
    const $ = id => document.getElementById(id), store = window.BottleNet;
    const sheets = { rates: $('sheet-rates'), help: $('sheet-help'), report: $('sheet-report') };
    let lastFocus = null;
    function fillRates() {
        const sizes = store.get().sizes;
        Object.entries(sizes).forEach(([key, size]) => {
            $('rate-' + key).textContent = size.minutes + ' minutes';
            $('weight-' + key).textContent = size.minWeight + '–' + size.maxWeight + ' g';
        });
    }
    function open(name) {
        const sheet = sheets[name];
        if (!sheet) return;
        if (name === 'rates') fillRates();
        lastFocus = document.activeElement;
        sheet.hidden = false;
        sheet.querySelector('.sheet-close').focus();
    }
    function closeAll() {
        Object.values(sheets).forEach(sheet => { sheet.hidden = true; });
        if (lastFocus) lastFocus.focus();
    }
    document.querySelectorAll('[data-sheet]').forEach(el => el.addEventListener('click', () => open(el.dataset.sheet)));
    document.querySelectorAll('.sheet-close').forEach(el => el.addEventListener('click', closeAll));
    Object.values(sheets).forEach(sheet => sheet.addEventListener('click', e => { if (e.target === sheet) closeAll(); }));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAll(); });
    window.addEventListener('bottlenet-change', () => { if (!sheets.rates.hidden) fillRates(); });
})();
