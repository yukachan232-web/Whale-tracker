export async function onRequestGet(context) {
    const url = new URL(context.request.url);
    const token = url.searchParams.get('token');
    
    if (!token) return new Response(JSON.stringify({ error: 'No token' }), { status: 400 });

    try {
        const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${token}`);
        const data = await res.json();
        
        let whaleBuys = 0;
        if (data.pairs && data.pairs[0].txns) {
            const txns = data.pairs[0].txns;
            // Cek transaksi buy 1 jam dan 24 jam terakhir
            const buys = (txns.h1?.buys || 0) + (txns.h24?.buys || 0);
            // Asumsi sederhana: jika volume buy 24 jam > $50,000, itu whale activity
            const vol = data.pairs[0].volume?.h24 || 0;
            if (vol > 50000) whaleBuys = Math.floor(vol / 10000); // Estimasi jumlah whale
        }

        return new Response(JSON.stringify({ whaleBuys }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}
