import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

const CAIXA_KEY = 'caixa_data_v1';
const METRICS_API = 'https://api.marujogastrobar.tech';
const API_KEY = 'marujo-metrics-integration-2026';
const ACCOUNT_ID = '36a7075a-16d6-4a31-9eca-2e699564aeb6';

export async function GET(request: Request) {
    try {
        const lotes = await kv.get<any[]>(CAIXA_KEY) || [];
        const conferidos = lotes.filter(l => l.status === 'conferido');
        
        let successCount = 0;
        let errorCount = 0;
        const results = [];

        for (const lote of conferidos) {
            // Calcula o resumo do lote exatamente como no useCaixa.ts
            const lancamentos = lote.lancamentos || [];
            const formasExcluidas = ['Pró-labore', 'Cortesia', 'Permuta'];

            let totalLiquido = 0;
            lancamentos.forEach((l: any) => {
                if (l.isSaida) return;
                if (formasExcluidas.includes(l.formaPagamento)) return;

                const valor = Number(l.valor || 0);
                const caixinha = Number(l.valorCaixinha || 0);
                totalLiquido += valor - caixinha;
            });

            if (totalLiquido <= 0) continue;

            try {
                const response = await fetch(`${METRICS_API}/integration/cash-register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': API_KEY,
                    },
                    body: JSON.stringify({
                        date: lote.dataReferencia,
                        period: lote.periodo,
                        totalAmount: totalLiquido,
                        account_id: ACCOUNT_ID,
                    }),
                });

                if (response.ok) {
                    successCount++;
                    results.push({ loteId: lote.id, success: true });
                } else {
                    errorCount++;
                    const errBody = await response.json().catch(() => ({}));
                    results.push({ loteId: lote.id, success: false, error: errBody });
                }
            } catch (err: any) {
                errorCount++;
                results.push({ loteId: lote.id, success: false, error: err.message });
            }
        }

        return NextResponse.json({
            success: true,
            totalSynced: conferidos.length,
            successCount,
            errorCount,
            results
        });
    } catch (error: any) {
        return NextResponse.json({ error: 'Erro na sincronização cron: ' + error.message }, { status: 500 });
    }
}
