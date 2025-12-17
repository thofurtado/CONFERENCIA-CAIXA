"use client"
import { useState, useEffect, useMemo } from 'react';

export function useCaixa() {
    const [lotes, setLotes] = useState<any[]>([]);
    const [loteAtivoId, setLoteAtivoId] = useState<string | null>(null);

    useEffect(() => {
        const salvo = localStorage.getItem('caixa_conferencia_v1');
        if (salvo) setLotes(JSON.parse(salvo));
    }, []);

    useEffect(() => {
        localStorage.setItem('caixa_conferencia_v1', JSON.stringify(lotes));
    }, [lotes]);

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
                if (l.banco === 'CAIXA') {
                    r.CAIXA.Dinheiro += valor;
                }
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

                if (l.isCaixinha) {
                    r.CAIXA.caixinhasGeral += valor;
                }
            }
        });

        r.GERAL.saldo = r.GERAL.entradas - r.GERAL.saidas;
        return r;
    }, [loteAtivo]);

    const criarNovoLote = (data: string, periodo: string) => {
        if (lotes.find(l => l.dataReferencia === data && l.periodo === periodo)) {
            alert("Já existe um caixa para este período hoje."); return;
        }
        const novo = { id: Date.now().toString(), dataReferencia: data, periodo: periodo, lancamentos: [] };
        setLotes([novo, ...lotes]); setLoteAtivoId(novo.id);
    };

    const adicionarLancamento = (dados: any) => {
        if (!loteAtivoId) return;
        const novoLancamento = {
            ...dados,
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        };
        setLotes(prev => prev.map(l =>
            l.id === loteAtivoId ? { ...l, lancamentos: [novoLancamento, ...l.lancamentos] } : l
        ));
    };

    const removerLancamento = (id: string | number) => {
        setLotes(prev => prev.map(l => l.id === loteAtivoId ? { ...l, lancamentos: l.lancamentos.filter((lan: any) => lan.id !== id) } : l));
    };

    const apagarLote = (id: string) => {
        if (confirm("Apagar?")) {
            setLotes(lotes.filter(l => l.id !== id));
            if (loteAtivoId === id) setLoteAtivoId(null);
        }
    };

    return { lotes, loteAtivo, setLoteAtivoId, criarNovoLote, adicionarLancamento, removerLancamento, apagarLote, resumoLote };
}