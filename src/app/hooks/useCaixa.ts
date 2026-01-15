"use client"
import { useState, useEffect } from 'react';

const IS_PROD = process.env.NODE_ENV === 'production';
const API_URL = '/api/caixa';
const LOCAL_STORAGE_KEY = '@marujo-caixa';

export function useCaixa() {
    const [lotes, setLotes] = useState<any[]>([]);
    const [loteAtivoId, setLoteAtivoId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            try {
                if (IS_PROD) {
                    const response = await fetch(API_URL);
                    const data = await response.json();
                    if (Array.isArray(data)) setLotes(data);
                } else {
                    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
                    if (saved) setLotes(JSON.parse(saved));
                }
            } catch (err) {
                console.error("Erro ao carregar dados:", err);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    useEffect(() => {
        if (loading) return;

        if (IS_PROD) {
            fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(lotes),
            }).catch(err => console.error("Erro ao persistir na nuvem:", err));
        } else {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(lotes));
        }
    }, [lotes, loading]);

    const loteAtivo = lotes.find(l => l.id === loteAtivoId);

    const criarNovoLote = (data: string, periodo: string, abertura: number) => {
        const jaExiste = lotes.find(l =>
            l.dataReferencia === data &&
            l.periodo.toLowerCase() === periodo.toLowerCase()
        );

        if (jaExiste) {
            alert(`Já existe um registro de ${periodo} para o dia ${new Date(data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}.`);
            return;
        }

        const id = Date.now().toString();
        const novo = {
            id,
            dataReferencia: data,
            periodo,
            valorAbertura: Number(abertura),
            lancamentos: [],
            status: 'pendente'
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

    const editarLancamento = (id: string, dadosAtualizados: any) => {
        setLotes(lotes.map(l => (l.id === loteAtivoId ? { ...l, lancamentos: l.lancamentos.map((lan: any) => lan.id === id ? { ...lan, ...dadosAtualizados } : lan) } : l)));
    };

    const editarAbertura = (novoValor: number) => {
        setLotes(lotes.map(l => (l.id === loteAtivoId ? { ...l, valorAbertura: novoValor } : l)));
    };

    const alterarStatus = (id: string, novoStatus: string) => {
        setLotes(lotes.map(l => (l.id === id ? { ...l, status: novoStatus } : l)));
    };

    const apagarLote = (id: string) => setLotes(lotes.filter(l => l.id !== id));

    const resumoLote = loteAtivo ? (() => {
        const lancamentos = loteAtivo.lancamentos || [];
        const bancos = ['SAFRA', 'PAGBANK', 'CIELO', 'IFOOD'];
        const formasCasa = ['Funcionário', 'Pró-labore', 'Cortesia', 'Permuta'];

        const resumo: any = {
            GERAL: { entradas: 0, totalCaixinha: 0, saldo: 0 },
            CAIXA: { saldoAbertura: Number(loteAtivo.valorAbertura || 0), entradasDinheiro: 0, totalSaidas: 0 },
            CASA: { total: 0 }
        };

        bancos.forEach(b => {
            resumo[b] = { PIX: 0, Débito: 0, Crédito: 0, Voucher: 0, caixinha: 0, total: 0 };
        });
        formasCasa.forEach(f => { resumo.CASA[f] = 0; });

        lancamentos.forEach((l: any) => {
            const valor = Number(l.valor || 0);
            const caixinha = Number(l.valorCaixinha || 0);
            const valorRealVenda = valor - caixinha;

            if (l.isSaida) {
                resumo.CAIXA.totalSaidas += valor;
            } else {
                resumo.GERAL.totalCaixinha += caixinha;

                if (l.formaPagamento === 'Dinheiro') {
                    resumo.CAIXA.entradasDinheiro += valorRealVenda;
                    resumo.GERAL.entradas += valorRealVenda;
                } else if (bancos.includes(l.banco)) {
                    if (resumo[l.banco][l.formaPagamento] !== undefined) {
                        resumo[l.banco][l.formaPagamento] += valorRealVenda;
                    }
                    resumo[l.banco].caixinha += caixinha;
                    resumo[l.banco].total += valorRealVenda;
                    resumo.GERAL.entradas += valorRealVenda;
                } else if (formasCasa.includes(l.formaPagamento)) {
                    resumo.CASA[l.formaPagamento] += valorRealVenda;
                    resumo.CASA.total += valorRealVenda;
                    resumo.GERAL.entradas += valorRealVenda;
                }
            }
        });

        resumo.GERAL.saldo = resumo.GERAL.entradas - resumo.CAIXA.totalSaidas;
        return resumo;
    })() : null;

    return {
        lotes,
        loteAtivo,
        setLoteAtivoId,
        criarNovoLote,
        adicionarLancamento,
        removerLancamento,
        editarLancamento,
        editarAbertura,
        alterarStatus,
        apagarLote,
        resumoLote,
        loading
    };
}