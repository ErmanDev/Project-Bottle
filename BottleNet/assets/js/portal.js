(() => {
    const $ = id => document.getElementById(id), store = window.BottleNet;
    const owner = `portal-${Math.random().toString(36).slice(2)}`;
    let depositing = false, processing = false, message = '', messageUntil = 0, pendingDeposit;
    const labels = { ready: 'Station ready for your next bottle', busy: 'Another deposit is in progress. Please wait.', full: 'Bin full. Deposits are temporarily unavailable.', maintenance: 'Station under maintenance. Please check back soon.', offline: 'Station offline. Please check back soon.' };
    function render() {
        const d = store.get(), active = d.expiresAt > Date.now(), locked = d.depositUntil > Date.now() && d.depositOwner !== owner;
        if (depositing && (d.depositUntil <= Date.now() || d.station !== 'ready')) {
            depositing = false;
            processing = false;
        }
        $('timer').textContent = store.time(d.expiresAt - Date.now());
        $('connection-badge').textContent = active ? 'Connected' : 'Time expired';
        $('connection-badge').className = `badge ${active ? 'blue' : 'amber'}`;
        $('timer-caption').textContent = active ? 'A little more time for what matters.' : 'A new bottle. A new connection.';
        $('session-bottles').textContent = d.sessionBottles;
        $('last-reward').textContent = `+${d.lastReward} min`;
        $('reward-rate').textContent = `${d.rate} minutes`;
        $('community-count').textContent = d.bottles;
        $('deposit-button').hidden = depositing;
        $('deposit-controls').hidden = !depositing;
        $('deposit-button').disabled = d.station !== 'ready' || locked;
        $('deposit-button').textContent = locked ? 'Station busy' : active ? '＋ Add more time' : '＋ Deposit bottles';
        $('preview-state').disabled = processing;
        $('reset-demo').disabled = processing;
        $('finish-deposit').disabled = processing;
        const feedback = messageUntil > Date.now() ? message : depositing ? 'Deposit window open. Insert your bottle.' : locked ? labels.busy : labels[d.station];
        $('deposit-feedback').textContent = feedback;
        $('deposit-feedback').classList.toggle('error', feedback.startsWith('Bottle rejected'));
    }
    function notify(text) { message = text; messageUntil = Date.now() + 6000; render(); }
    $('deposit-button').addEventListener('click', () => { const d = store.get(); if (d.station !== 'ready' || d.depositUntil > Date.now() && d.depositOwner !== owner)
        return; depositing = true; messageUntil = 0; store.update(s => { s.depositOwner = owner; s.depositUntil = Date.now() + 60000; }); render(); });
    function deposit(accepted) { if (processing || !depositing)
        return; processing = true; notify('Checking bottle...'); pendingDeposit = setTimeout(() => { const d = store.get(); if (d.station !== 'ready' || d.depositOwner !== owner || d.depositUntil <= Date.now()) {
        processing = false;
        depositing = false;
        notify('Deposit interrupted. No time was awarded.');
        return;
    } store.update(s => { const weight = accepted ? Math.round((s.minWeight + s.maxWeight) * 5) / 10 : Math.max(0, s.minWeight - 2.7); s.transactions.unshift({ id: `BN-${Date.now()}`, time: Date.now(), session: 'Your device', weight, accepted, minutes: accepted ? s.rate : 0 }); if (accepted) {
        s.bottles++;
        s.sessionBottles++;
        s.lastReward = s.rate;
        s.expiresAt = Math.max(Date.now(), s.expiresAt) + s.rate * 60000;
        s.bin = Math.min(100, s.bin + 1);
        s.collections[6] = s.bottles;
        if (s.bin === 100)
            s.station = 'full';
    } s.depositUntil = Date.now() + 60000; }); processing = false; notify(accepted ? `Bottle accepted. +${d.rate} minutes added.` : 'Bottle rejected. Weight is outside the accepted range.'); }, 900); }
    $('finish-deposit').onclick = () => { depositing = false; store.update(d => { d.depositUntil = 0; d.depositOwner = null; }); notify('All set. Enjoy your connection.'); };
    $('preview-state').onchange = e => {
        const state = e.target.value;
        if (state === 'accepted' || state === 'rejected') {
            const d = store.get();
            if (!depositing && d.station === 'ready') $('deposit-button').click();
            if (depositing) deposit(state === 'accepted');
            else notify('Station unavailable. Choose Ready before previewing a bottle.');
            e.target.value = d.station;
            return;
        }
        clearTimeout(pendingDeposit);
        processing = false;
        depositing = false; messageUntil = 0; store.update(d => { d.depositUntil = 0; d.depositOwner = null; if (state === 'expired') {
        d.expiresAt = Date.now();
        d.station = 'ready';
    }
    else
        d.station = state; }); render(); };
    $('reset-demo').onclick = () => { depositing = false; messageUntil = 0; store.reset(); $('preview-state').value = 'ready'; render(); };
    window.addEventListener('storage', render);
    window.addEventListener('bottlenet-change', render);
    setInterval(render, 1000);
    render();
})();
