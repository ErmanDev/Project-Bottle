/* Kiosk home screen: informational sheets for the menu rows. */
(() => {
    const $ = id => document.getElementById(id), store = window.BottleNet;
    const sheets = { rates: $('sheet-rates'), help: $('sheet-help'), report: $('sheet-report') };
    let lastFocus = null;
    function fillRates() {
        const list = $('sheet-rate-list');
        list.replaceChildren(...Object.values(store.get().sizes).map(size => {
            const row = document.createElement('div');
            row.className = 'sheet-rate';
            const label = document.createElement('span');
            const name = document.createElement('strong');
            name.textContent = size.label;
            const weight = document.createElement('small');
            weight.textContent = `${size.minWeight}–${size.maxWeight} g`;
            label.append(name, document.createElement('br'), weight);
            const minutes = document.createElement('strong');
            minutes.textContent = `${size.minutes} minutes`;
            row.append(label, minutes);
            return row;
        }));
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
    window.addEventListener('storage', () => { if (!sheets.rates.hidden) fillRates(); });
    window.addEventListener('bottlenet-change', () => { if (!sheets.rates.hidden) fillRates(); });
})();
