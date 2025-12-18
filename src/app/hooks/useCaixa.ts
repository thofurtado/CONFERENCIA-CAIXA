"use client"
import { useState, useEffect } from 'react';

export function useCaixa() {
    const [lotes, setLotes] = useState<any[]>([]);
    const [loteAtivoId, setLoteAtivoId] = useState<string | null>(null);

    useEffect(() => {
        const saved = localStorage.getItem('@marujo-caixa');
        if (saved) setLotes(JSON.parse(saved));
    }, []);

    useEffect(() => {
        localStorage.setItem('@marujo-caixa', JSON.stringify(lotes));
    }, [lotes]);

    const loteAtivo = lotes.find(l => l.id === loteAtivoId);

    const resumoLote = loteAtivo ? (() => {
        const lancamentos = loteAtivo.lancamentos || [];
        const bancos = ['SAFRA', 'PAGBANK', 'CIELO'];
        const formasCasa = ['Funcionário', 'Pró-labore', 'Cortesia', 'Permuta'];

        const resumo: any = {
            GERAL: { entradas: 0, totalCaixinha: 0, saldo: 0 },
            CAIXA: { saldoAbertura: Number(loteAtivo.valorAbertura || 0), entradasDinheiro: 0, totalSaidas: 0 },
            CASA: { total: 0 }
        };

        // Inicializa bancos e formas da casa no objeto
        bancos.forEach(b => {
            resumo[b] = { PIX: 0, Débito: 0, Crédito: 0, caixinha: 0, total: 0 };
        });
        formasCasa.forEach(f => { resumo.CASA[f] = 0; });

        lancamentos.forEach((l: any) => {
            const valor = Number(l.valor || 0);
            const caixinha = Number(l.valorCaixinha || 0);
            const valorRealVenda = valor - caixinha;

            if (l.isSaida) {
                resumo.CAIXA.totalSaidas += valor;
            } else {
                // Soma Caixinha Geral
                resumo.GERAL.totalCaixinha += caixinha;

                if (l.formaPagamento === 'Dinheiro') {
                    resumo.CAIXA.entradasDinheiro += valorRealVenda;
                    resumo.GERAL.entradas += valorRealVenda;
                } else if (bancos.includes(l.banco)) {
                    resumo[l.banco][l.formaPagamento] += valorRealVenda;
                    resumo[l.banco].caixinha += caixinha;
                    resumo[l.banco].total += valorRealVenda;
                    resumo.GERAL.entradas += valorRealVenda;
                } else if (formasCasa.includes(l.formaPagamento)) {
                    resumo.CASA[l.formaPagamento] += valorRealVenda;
                    resumo.CASA.total += valorRealVenda;
                }
            }
        });

        resumo.GERAL.saldo = resumo.GERAL.entradas - resumo.CAIXA.totalSaidas;
        return resumo;
    })() : null;

    const criarNovoLote = (data: string, periodo: string, abertura: number) => {
        // Correção do Invalid Date: Garantir que a string de data esteja no formato correto
        const id = Date.now().toString();
        const novo = {
            id,
            dataReferencia: data, // Salva a string "YYYY-MM-DD" diretamente
            periodo,
            valorAbertura: Number(abertura),
            lancamentos: [],
            status: 'aberto'
        };
        setLotes([...lotes, novo]);
        setLoteAtivoId(id);
    };

    const adicionarLancamento = (novo: any) => {
        setLotes(lotes.map(l => (l.id === loteAtivoId ? { ...l, lancamentos: [...l.lancamentos, { ...novo, id: Date.now().toString() }] } : l)));
    };

    const removerLancamento = (id: string) => {
        setLotes(lotes.map(l => (l.id === loteAtivoId ? { ...l, lancamentos: l.lancamentos.filter((lan: any) => lan.id !== id) } : l)));
    };

    const apagarLote = (id: string) => setLotes(lotes.filter(l => l.id !== id));

    return { lotes, loteAtivo, setLoteAtivoId, criarNovoLote, adicionarLancamento, removerLancamento, apagarLote, resumoLote };
}