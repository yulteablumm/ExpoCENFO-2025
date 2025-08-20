async function askAIServer(prompt) {
    // Encolar para que solo haya una llamada a la vez
    return aiAskQueue = aiAskQueue.then(async () => {
        // Reintentos con backoff ante 429/errores transitorios
        let attempt = 0;
        let lastErr = null;
        while (attempt < 3) {
            attempt++;
            try {
                const res = await fetch('/ask', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ question: prompt })
                });
                if (!res.ok) {
                    // 429 Too Many Requests
                    if (res.status === 429) {
                        const wait = 1000 * Math.pow(2, attempt - 1);
                        await sleep(wait);
                        const e = new Error('Rate limit /ask');
                        e.rateLimit = true;
                        lastErr = e;
                        continue; // retry
                    }
                    // Otros errores: intentar leer texto para log
                    const txt = await res.text().catch(() => '');
                    throw new Error(`Error /ask ${res.status}: ${txt.slice(0,200)}`);
                }

                let data;
                try {
                    data = await res.json();
                } catch (e) {
                    // Puede haber HTML de error pese a 200
                    const txt = await res.text().catch(() => '');
                    throw new Error(`Respuesta no JSON en /ask: ${txt.slice(0,200)}`);
                }
                if (!data || !data.id) throw new Error('ID no recibido para sugerencias');

                // Polling a /result con manejo de 429
                for (let i = 0; i < 20; i++) {
                    await sleep(1000);
                    const r2 = await fetch(`/result?id=${data.id}`);
                    if (r2.status === 429) {
                        // backoff ligero y continuar
                        await sleep(500);
                        continue;
                    }
                    if (!r2.ok) {
                        const txt2 = await r2.text().catch(() => '');
                        throw new Error(`Error /result ${r2.status}: ${txt2.slice(0,200)}`);
                    }
                    let d2;
                    try { d2 = await r2.json(); } catch (e) { d2 = null; }
                    if (d2 && d2.response !== null && d2.response !== undefined) {
                        return d2.response;
                    }
                }
                throw new Error('Timeout al obtener sugerencias');
            } catch (err) {
                lastErr = err;
                // Si 429, activar cooldown y seguir backoff
                if (err && (err.rateLimit || String(err.message||'').includes('429'))) {
                    suggestionsCooldownUntil = Date.now() + SUGGESTIONS_COOLDOWN_MS;
                    const wait = 1000 * Math.pow(2, attempt - 1);
                    await sleep(wait);
                    continue;
                }
                // Errores no recuperables
                break;
            }
        }
        if (lastErr) throw lastErr;
        throw new Error('Fallo desconocido al obtener sugerencias');
    });
}
