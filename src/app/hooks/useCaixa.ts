"use client"
import { useState, useEffect, useMemo } from 'react';

export function useCaixa() {
    const [lotes, setLotes] = useState<any[]>([]);
    const [loteAtivoId, setLoteAtivoId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Carregar dados da Vercel KV ao iniciar
    useEffect(() => {
        async function carregarDados() {
            try {
                const response = await fetch('/api/caixa');
                const data = await response.json();
                if (data) setLotes(data);
            } catch (error) {
                console.error("Erro ao carregar dados:", error);
            } finally {
                setIsLoading(false);
            }
        }
        carregarDados();
    }, []);

    // Sincronizar com a Vercel KV sempre que os lotes mudarem
    const salvarNoBanco = async (novosLotes: any[]) => {
        try {
            await fetch('/api/caixa', {
                method: 'POST',
                body: JSON.stringify(novosLotes),
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (error) {
            console.error("Erro ao salvar no banco:", error);
        }
    };

    const loteAtivo = useMemo(() => lotes.find(l => l.id === loteAtivoId), [lotes, loteAtivoId]);

    const resumoLote = useMemo(() => {
        const r = {
            CAIXA: { Dinheiro: 0, caixinhasGeral: 0, totalSaidas: 0 },
            CASA: { Funcionário: 0, 'Pró-labore': 0, Cortesia: 0, Permuta: 0 },
            SAFRA: { PIX: 0, Débito: 0, Crédito: 0, total: 0 },
            PAGBANK: { PIX: 0, Débito: 0, Crédito: 0, total: 0 },
            CIELO: { PIX: 0, Débito: 0, Crédito: 0, total: 0 },
            GERAL: { entradas: 0, saidas: 0, saldo: 0 }
        };

        loteAtivo?.lancamentos.forEach((l: any) => {
            const valor = l.valor;
            if (l.isSaida) {
                r.CAIXA.totalSaidas += valor;
                r.CAIXA.Dinheiro -= valor;
                r.GERAL.saidas += valor;
            } else {
                r.GERAL.entradas += valor;
                if (l.banco === 'CAIXA') r.CAIXA.Dinheiro += valor;
                else if (l.banco === 'CONTA DA CASA') {
                    const forma = l.formaPagamento as keyof typeof r.CASA;
                    if (r.CASA[forma] !== undefined) r.CASA[forma] += valor;
                }
                else if (['SAFRA', 'PAGBANK', 'CIELO'].includes(l.banco)) {
                    const b = l.banco as 'SAFRA' | 'PAGBANK' | 'CIELO';
                    const forma = l.formaPagamento as 'PIX' | 'Débito' | 'Crédito';
                    (r[b] as any)[forma] += valor;
                    (r[b] as any).total += valor;
                }
                if (l.isCaixinha) r.CAIXA.caixinhasGeral += valor;
            }
        });

        r.GERAL.saldo = r.GERAL.entradas - r.GERAL.saidas;
        return r;
    }, [loteAtivo]);

    const criarNovoLote = (data: string, periodo: string) => {
        if (lotes.find(l => l.dataReferencia === data && l.periodo === periodo)) {
            alert("Já existe um caixa para este período hoje."); return;
        }
        const novo = { id: Date.now().toString(), dataReferencia: data, periodo: periodo, lancamentos: [], conferido: false };
        const novaLista = [novo, ...lotes];
        setLotes(novaLista);
        setLoteAtivoId(novo.id);
        salvarNoBanco(novaLista);
    };

    const adicionarLancamento = (dados: any) => {
        if (!loteAtivoId) return;
        const novoLancamento = {
            ...dados,
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        };
        const novaLista = lotes.map(l =>
            l.id === loteAtivoId ? { ...l, lancamentos: [novoLancamento, ...l.lancamentos] } : l
        );
        setLotes(novaLista);
        salvarNoBanco(novaLista);
    };

    const removerLancamento = (id: string | number) => {
        const novaLista = lotes.map(l =>
            l.id === loteAtivoId ? { ...l, lancamentos: l.lancamentos.filter((lan: any) => lan.id !== id) } : l
        );
        setLotes(novaLista);
        salvarNoBanco(novaLista);
    };

    const apagarLote = (id: string) => {
        if (confirm("Apagar?")) {
            const novaLista = lotes.filter(l => l.id !== id);
            setLotes(novaLista);
            if (loteAtivoId === id) setLoteAtivoId(null);
            salvarNoBanco(novaLista);
        }
    };

    return { lotes, loteAtivo, setLoteAtivoId, criarNovoLote, adicionarLancamento, removerLancamento, apagarLote, resumoLote, isLoading };
}