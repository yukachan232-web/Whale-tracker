document.addEventListener('DOMContentLoaded', loadCoins);

async function loadCoins() {
    const list = document.getElementById('coin-list');
    const loading = document.getElementById('loading');
    
    try {
        const res = await fetch('/api/meme-coins');
        const data = await res.json();
        loading.style.display = 'none';
        
        list.innerHTML = data.coins.map(c => `
            <div class="card" onclick="checkWhale('${c.address}', '${c.chain}', '${c.symbol}')">
                <h3>${c.symbol}</h3>
                <div class="price">$${parseFloat(c.price).toFixed(8)}</div>
                <div class="vol">Vol: $${(c.volume/1000).toFixed(1)}K</div>
                <div class="change ${c.change >= 0 ? 'up' : 'down'}">${c.change > 0 ? '+' : ''}${c.change.toFixed(2)}%</div>
            </div>
        `).join('');
    } catch (e) {
        loading.innerText = 'Gagal memuat data API.';
    }
}

async function checkWhale(address, chain, symbol) {
    const alertSection = document.getElementById('alerts');
    const alertContent = document.getElementById('alert-content');
    
    alertContent.innerHTML = 'Menganalisis on-chain data...';
    alertSection.classList.remove('hidden');

    try {
        const [whaleRes, safetyRes] = await Promise.all([
            fetch(`/api/whales?token=${address}`),
            fetch(`/api/safety?token=${address}&chain=${chain}`)
        ]);
        
        const whaleData = await whaleRes.json();
        const safetyData = await safetyRes.json();

        let html = `<strong>🔍 ${symbol} Analysis:</strong><br><br>`;
        
        // Whale Alert
        if (whaleData.whaleBuys > 0) {
            html += `<span style="color:#00ff41">✅ Terdeteksi ${whaleData.whaleBuys} transaksi besar (Whale Buy) dalam 24 jam terakhir.</span><br>`;
        } else {
            html += `<span style="color:#888">⚪ Tidak ada transaksi whale signifikan terdeteksi.</span><br>`;
        }

        // Safety Alert
        if (safetyData.isHoneypot) {
            html += `<br><span style="color:#ff3333; font-weight:bold;">⚠️ BAHAYA: HONEYPOT TERDETEKSI! (Tidak bisa dijual)</span>`;
        } else if (!safetyData.canSell) {
            html += `<br><span style="color:#ff3333;">⚠️ Fungsi jual dimatikan oleh developer.</span>`;
        } else {
            html += `<br><span style="color:#00ff41;">🛡️ Kontrak aman dari Honeypot dasar.</span>`;
        }

        alertContent.innerHTML = html;
    } catch (e) {
        alertContent.innerHTML = 'Gagal mengambil data analisis.';
    }
}
