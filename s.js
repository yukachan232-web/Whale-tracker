export async function onRequestGet(context) {
    const url = new URL(context.request.url);
    const token = url.searchParams.get('token');
    const chain = url.searchParams.get('chain') || 'ethereum';

    if (!token) return new Response(JSON.stringify({ error: 'No token' }), { status: 400 });

    try {
        // Menggunakan GoPlus Security API (Gratis)
        const res = await fetch(`https://api.gopluslabs.io/api/v1/token_security/${chain}?contract_addresses=${token}`);
        const data = await res.json();
        
        const info = data.result ? data.result[token.toLowerCase()] : null;
        
        return new Response(JSON.stringify({
            isHoneypot: info?.is_honeypot === '1',
            canSell: info?.can_sell !== '0',
            buyTax: info?.buy_tax || 'Unknown',
            sellTax: info?.sell_tax || 'Unknown'
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}
