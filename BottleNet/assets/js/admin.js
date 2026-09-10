(() => {
    const $ = id => document.getElementById(id), store = window.BottleNet, inputs = [...document.querySelectorAll('.pin-fields input')];
    let tab = 'overview', filter = 'all', query = '';
    let unlocked = false;
    try {
        unlocked = sessionStorage.getItem('bottlenet-admin') === 'yes';
    }
    catch { }
    function show() { $('login-view').hidden = unlocked; $('dashboard-view').hidden = !unlocked; if (unlocked)
        render();
    else
        inputs[0].focus(); }
    inputs.forEach((input, i) => { input.oninput = () => { input.value = input.value.replace(/\D/g, '').slice(-1); $('pin-error').textContent = ''; if (input.value && i < 3)
        inputs[i + 1].focus(); }; input.onkeydown = e => { if (e.key === 'Backspace' && !input.value && i > 0)
        inputs[i - 1].focus(); if (e.key === 'ArrowLeft' && i > 0)
        inputs[i - 1].focus(); if (e.key === 'ArrowRight' && i < 3)
        inputs[i + 1].focus(); }; input.onpaste = e => { e.preventDefault(); const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4); [...digits].forEach((n, j) => inputs[j].value = n); inputs[Math.min(digits.length, 3)].focus(); }; });
    $('pin-form').onsubmit = e => { e.preventDefault(); if (inputs.map(i => i.value).join('') === '1234') {
        unlocked = true;
        try {
            sessionStorage.setItem('bottlenet-admin', 'yes');
        }
        catch { }
        show();
    }
    else {
        $('pin-error').textContent = 'Incorrect PIN. Please try again.';
        inputs.forEach(i => i.value = '');
        inputs[0].focus();
    } };
    $('sign-out').onclick = () => { unlocked = false; try {
        sessionStorage.removeItem('bottlenet-admin');
    }
    catch { } inputs.forEach(i => i.value = ''); show(); };
    const descriptions = { overview: ['Station overview', 'A live look at your station and its impact.'], transactions: ['Transactions', 'Every bottle and every connection, accounted for.'], sessions: ['Active sessions', 'Manage the connections your station makes possible.'], machine: ['Machine status', 'Station health, collection capacity, and maintenance.'], settings: ['Station settings', 'Manage bottle acceptance and connection rewards.'] };
    const badge = (text, color = 'green') => `<span class="badge ${color}">${text}</span>`;
    const metric = (label, value, foot) => `<div class="metric"><div class="metric-label">${label}<span>↗</span></div><div class="metric-value">${value}</div><div class="metric-foot">${foot}</div></div>`;
    function rows(transactions) { return transactions.length ? transactions.map(t => `<tr><td>${t.id}</td><td>${new Date(t.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td><td>${t.session}</td><td>${t.weight.toFixed(1)} g</td><td>${badge(t.accepted ? 'Accepted' : 'Rejected', t.accepted ? 'green' : 'red')}</td><td>${t.minutes ? `+${t.minutes} min` : '—'}</td></tr>`).join('') : '<tr><td colspan="6" class="empty-state">No matching transactions.</td></tr>'; }
    const table = transactions => `<div class="table-wrap"><table><thead><tr><th>TRANSACTION</th><th>TIME</th><th>SESSION</th><th>WEIGHT</th><th>RESULT</th><th>TIME AWARDED</th></tr></thead><tbody id="transaction-rows">${rows(transactions)}</tbody></table></div>`;
    function navigate(next) { tab = next; query = ''; filter = 'all'; $('admin-toast').textContent = ''; render(); }
    $('admin-nav').onclick = e => { const b = e.target.closest('[data-tab]'); if (b)
        navigate(b.dataset.tab); };
    function render() {
        if (!unlocked)
            return;
        const d = store.get(), active = d.sessions.filter(s => s.expiresAt > Date.now()), own = d.expiresAt > Date.now();
        $('breadcrumb').textContent = tab[0].toUpperCase() + tab.slice(1);
        $('page-title').textContent = descriptions[tab][0];
        $('page-description').textContent = descriptions[tab][1];
        document.querySelectorAll('[data-tab]').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
        $('sidebar-status').textContent = d.station === 'ready' ? 'Station online' : d.station[0].toUpperCase() + d.station.slice(1);
        if (tab === 'overview') {
            $('admin-content').innerHTML = `<section class="metrics">${metric('Bottles collected today', d.bottles, 'Collected for a better tomorrow')}${metric('Active connections', active.length + Number(own), 'Devices connected right now')}${metric('Minutes awarded today', 1280 + d.transactions.filter(t => t.id.length > 10).reduce((n, t) => n + t.minutes, 0), 'More time to stay connected')}${metric('Bin capacity', `${d.bin}%`, d.bin >= 90 ? 'Collection needed' : 'Space for more good habits')}</section><div class="overview-grid"><section class="section-surface"><div class="section-title"><div><h2>A week of small changes</h2><p>Bottles collected over the last 7 days</p></div>${badge('This week')}</div><div class="chart" role="img" aria-label="Daily bottle collection: ${d.collections.join(', ')}">${d.collections.map((n, i) => `<div class="chart-column"><div class="chart-bar" style="height:${n / Math.max(...d.collections) * 115}px" title="${n} bottles"></div><span>${['Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Today'][i]}</span></div>`).join('')}</div><div class="chart-footer"><span>Every bottle makes a difference</span><strong>${d.collections.reduce((a, b) => a + b, 0)} bottles</strong></div></section><section class="section-surface"><div class="section-title"><h2>Your station</h2>${badge(d.station === 'ready' ? 'Online' : d.station, d.station === 'ready' ? 'green' : 'amber')}</div><div class="machine-summary"><div class="machine-summary-row"><span>Campus station 01</span><span class="muted">BN-001</span></div><div class="machine-summary-row"><span>Collection bin</span><strong>${d.bin}% full</strong></div><div class="progress-track"><div class="progress-fill" style="width:${d.bin}%"></div></div><p>${d.bin >= 90 ? 'Ready for collection' : 'Collection capacity available'}</p><button class="button secondary full" id="view-machine">View machine details →</button></div></section></div><section class="section-surface"><div class="section-title"><div><h2>Recent transactions</h2><p>The latest activity at your station</p></div><button class="text-button" id="view-transactions">View all →</button></div>${table(d.transactions.slice(0, 5))}</section>`;
            $('view-machine').onclick = () => navigate('machine');
            $('view-transactions').onclick = () => navigate('transactions');
        }
        if (tab === 'transactions') {
            $('admin-content').innerHTML = `<section class="section-surface"><div class="table-toolbar"><input id="transaction-search" class="field" placeholder="Search transaction or session" aria-label="Search transactions"><select id="transaction-filter" aria-label="Filter result"><option value="all">All results</option><option value="accepted">Accepted</option><option value="rejected">Rejected</option></select></div>${table(d.transactions)}</section>`;
            $('transaction-search').value = query;
            $('transaction-filter').value = filter;
            const refresh = () => { $('transaction-rows').innerHTML = rows(store.get().transactions.filter(t => (filter === 'all' || t.accepted === (filter === 'accepted')) && `${t.id} ${t.session}`.toLowerCase().includes(query.toLowerCase()))); };
            $('transaction-search').oninput = e => { query = e.target.value; refresh(); };
            $('transaction-filter').onchange = e => { filter = e.target.value; refresh(); };
            refresh();
        }
        if (tab === 'sessions') {
            const sessions = [...(own ? [{ id: 'own', name: 'Your device', expiresAt: d.expiresAt, bottles: d.sessionBottles }] : []), ...active];
            $('admin-content').innerHTML = `<section class="section-surface"><div class="section-title"><h2>Connected devices</h2>${badge(`${sessions.length} active`, 'blue')}</div><div class="table-wrap"><table><thead><tr><th>DEVICE</th><th>STATUS</th><th>BOTTLES</th><th>REMAINING</th><th>ACTION</th></tr></thead><tbody>${sessions.map(s => `<tr><td>${s.name}</td><td>${badge('Connected', 'blue')}</td><td>${s.bottles}</td><td data-expiry="${s.expiresAt}">${store.time(s.expiresAt - Date.now())}</td><td><button class="text-button" data-end="${s.id}">End session</button></td></tr>`).join('') || '<tr><td colspan="5" class="empty-state">No active sessions.</td></tr>'}</tbody></table></div></section>`;
            document.querySelectorAll('[data-end]').forEach(b => b.onclick = () => { if (!confirm('End this device\'s mock session?'))
                return; store.update(s => { if (b.dataset.end === 'own')
                s.expiresAt = Date.now();
            else
                s.sessions = s.sessions.filter(x => x.id !== b.dataset.end); }); render(); toast('Session ended.'); });
        }
        if (tab === 'machine') {
            $('admin-content').innerHTML = `<div class="machine-details"><section class="section-surface"><div class="section-title"><h2>Station diagnostics</h2>${badge('Simulated')}</div><div class="detail-list"><div><span>Controller</span><strong>ESP32 / BN-001</strong></div><div><span>Status</span>${badge(d.station, d.station === 'ready' ? 'green' : 'amber')}</div><div><span>Bin fill level</span><strong>${d.bin}%</strong></div><div><span>Last bottle weight</span><strong>${d.transactions[0].weight} g</strong></div><div><span>Load cell</span>${badge('Operational')}</div><div><span>Internet gateway</span>${badge('Mock connection', 'blue')}</div></div></section><section class="section-surface"><div class="section-title"><h2>Station controls</h2></div><div class="machine-summary"><div class="form-row"><div><label for="maintenance">Maintenance mode</label><p>Temporarily suspend new deposits.</p></div><input id="maintenance" type="checkbox" class="toggle" ${d.station === 'maintenance' ? 'checked' : ''}></div><div class="form-row"><div><h3>Collection complete</h3><p>Record an emptied collection bin.</p></div><button class="button secondary" id="empty-bin">Empty bin</button></div></div></section></div>`;
            $('maintenance').onchange = e => { store.update(s => { s.station = e.target.checked ? 'maintenance' : s.bin >= 100 ? 'full' : 'ready'; s.depositUntil = 0; }); render(); toast('Station availability updated.'); };
            $('empty-bin').onclick = () => { if (!confirm('Record that the bin has been emptied?'))
                return; store.update(s => { s.bin = 0; if (s.station === 'full')
                s.station = 'ready'; }); render(); toast('Bin collection recorded.'); };
        }
        if (tab === 'settings') {
            $('admin-content').innerHTML = `<form id="settings-form" class="settings-form"><div class="form-row"><div><label for="rate">Wi-Fi reward</label><p>Minutes awarded for each accepted bottle.</p></div><input class="field" id="rate" type="number" min="1" max="120" required value="${d.rate}"></div><div class="form-row"><div><label for="min-weight">Minimum bottle weight</label><p>Lower acceptance threshold, in grams.</p></div><input class="field" id="min-weight" type="number" min="1" max="200" step="0.1" required value="${d.minWeight}"></div><div class="form-row"><div><label for="max-weight">Maximum bottle weight</label><p>Upper acceptance threshold, in grams.</p></div><input class="field" id="max-weight" type="number" min="1" max="200" step="0.1" required value="${d.maxWeight}"></div><div class="form-row"><div><h3>Administrator PIN</h3><p>Demo PIN is 1234. Production authentication requires a backend.</p></div>${badge('Demo only')}</div><button class="button primary" type="submit">Save changes</button></form>`;
            $('settings-form').onsubmit = e => { e.preventDefault(); const min = Number($('min-weight').value), max = Number($('max-weight').value); if (min >= max) {
                toast('Minimum weight must be less than maximum weight.');
                return;
            } store.update(s => { s.rate = Number($('rate').value); s.minWeight = min; s.maxWeight = max; }); toast('Settings saved. New deposits will use the updated reward.'); };
        }
    }
    function toast(text) { $('admin-toast').textContent = text; }
    $('export-button').onclick = () => { const d = store.get(), csv = [['Transaction', 'Timestamp', 'Session', 'Weight (g)', 'Result', 'Minutes'], ...d.transactions.map(t => [t.id, new Date(t.time).toISOString(), t.session, t.weight, t.accepted ? 'Accepted' : 'Rejected', t.minutes])].map(r => r.map(v => `"${String(v).replaceAll('"', '""')}"`).join(',')).join('\r\n'); const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' })), a = document.createElement('a'); a.href = url; a.download = 'bottlenet-transactions.csv'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); toast('Transaction export downloaded.'); };
    window.addEventListener('storage', () => { if (tab !== 'settings')
        render(); });
    setInterval(() => { if (!unlocked || tab !== 'sessions')
        return; let expired = false; document.querySelectorAll('[data-expiry]').forEach(el => { el.textContent = store.time(Number(el.dataset.expiry) - Date.now()); if (Number(el.dataset.expiry) <= Date.now())
        expired = true; }); if (expired)
        render(); }, 1000);
    show();
})();
