export async function onRequestGet() {
    try {
        const res = await fetch('https://api.dexscreener.com/latest/dex/search?q=meme&order=volume&sort=desc');
        const data = await res.json();
        
        const coins = (data.pairs || [])
            .filter(p => p.volume && p.volume.h24 > 10000 && p.liquidity && p.liquidity.usd > 5000)
            .slice(0, 20)
            .map(p => ({
                symbol: p.baseToken.symbol,
                address: p.baseToken.address,
                chain: p.chainId,
                price: p.priceUsd,
                volume: p.volume.h24,
                change: p.priceChange.h24 || 0
            }));

        return new Response(JSON.stringify({ coins }), {
            headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=60' }
        });
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}
