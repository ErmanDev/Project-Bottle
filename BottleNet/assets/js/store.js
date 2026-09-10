/* Shared mock state. Network authorization belongs in a real backend/router integration. */
(() => {
    const KEY = 'bottlenet-demo-v1';
    const seed = () => ({ rate: 10, minWeight: 10, maxWeight: 70, bin: 64, station: 'ready', bottles: 128, sessionBottles: 2, lastReward: 10, expiresAt: Date.now() + 1122000, depositOwner: null, depositUntil: 0, transactions: Array.from({ length: 8 }, (_, i) => ({ id: `BN-${1048 - i}`, time: Date.now() - i * 240000, session: i === 0 ? 'Your device' : `Device ${i + 1}`, weight: [18.4, 12.1, 7.3, 24.8, 16.2, 32.4, 11.8, 20.5][i], accepted: i !== 2, minutes: i === 2 ? 0 : 10 })), sessions: Array.from({ length: 7 }, (_, i) => ({ id: `device-${i + 2}`, name: `Device ${i + 2}`, expiresAt: Date.now() + (i + 1) * 360000, bottles: i + 1 })), collections: [48, 72, 59, 91, 84, 112, 128] });
    let fallback;
    function get() { try {
        const raw = localStorage.getItem(KEY);
        if (raw)
            return JSON.parse(raw);
    }
    catch { } return fallback || reset(); }
    function save(data) { fallback = data; try {
        localStorage.setItem(KEY, JSON.stringify(data));
    }
    catch { } window.dispatchEvent(new Event('bottlenet-change')); return data; }
    function reset() { return save(seed()); }
    function update(fn) { const data = get(); fn(data); return save(data); }
    function time(ms) { const seconds = Math.max(0, Math.ceil(ms / 1000)); return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`; }
    window.BottleNet = { get, save, reset, update, time };
})();
