"use client"
import { useState, useMemo } from 'react';
import { ArrowLeft, ShoppingBag, ArrowUpDown, Trash2, Wallet2, Printer } from 'lucide-react';
import { SummaryCards } from './SummaryCards';
import { TransactionForm } from './TransactionForm';
import { CaixinhasTable } from './CaixinhasTable'; // Importação adicionada
import { exportarLotePDF } from '../utils/exportPDF';

interface DetalheLoteProps {
    loteAtivo: any;
    resumoLote: any;
    onVoltar: () => void;
    onAdicionarLancamento: (l: any) => void;
    onRemoverLancamento: (id: string) => void;
}

export function DetalheLote({ loteAtivo, resumoLote, onVoltar, onAdicionarLancamento, onRemoverLancamento }: DetalheLoteProps) {
    const [filtro, setFiltro] = useState({ mesa: '', banco: '', forma: '' });
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' | null }>({ key: '', direction: null });

    const entradasRaw = loteAtivo.lancamentos.filter((l: any) => !l.isSaida);
    const sangrias = loteAtivo.lancamentos.filter((l: any) => l.isSaida);

    const entradasProcessadas = useMemo(() => {
        let result = [...entradasRaw];
        if (filtro.mesa) result = result.filter(l => l.mesa?.toString().includes(filtro.mesa));
        if (filtro.banco) result = result.filter(l => l.banco.toLowerCase().includes(filtro.banco.toLowerCase()));
        if (filtro.forma) result = result.filter(l => l.formaPagamento.toLowerCase().includes(filtro.forma.toLowerCase()));

        if (sortConfig.key) {
            result.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
                if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return result;
    }, [entradasRaw, filtro, sortConfig]);

    const toggleSort = (key: string) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    return (
        <div className="min-h-screen bg-zinc-50 p-3 md:p-8 space-y-4 md:space-y-6 text-zinc-900">
            <header className="max-w-[1400px] mx-auto flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 md:gap-4">
                    <button onClick={onVoltar} className="p-3 bg-white border rounded-xl shadow-sm text-zinc-400 active:bg-zinc-100">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="font-black uppercase text-sm md:text-xl leading-none">
                            {new Date(loteAtivo.dataReferencia).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                        </h1>
                        <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">{loteAtivo.periodo}</span>
                    </div>
                </div>

                <button onClick={() => exportarLotePDF(loteAtivo, resumoLote)} className="bg-zinc-900 text-white p-3 md:px-5 md:py-3 rounded-xl md:rounded-2xl font-black uppercase text-[10px] shadow-lg flex items-center gap-2 active:scale-95 transition-transform">
                    <Printer size={18} />
                    <span className="hidden md:inline">Exportar PDF</span>
                </button>
            </header>

            <div className="max-w-[1400px] mx-auto space-y-4 md:space-y-6">
                <SummaryCards resumo={resumoLote} />
                <TransactionForm onAdd={onAdicionarLancamento} />

                {/* Tabela de Vendas */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 px-2 text-zinc-400 uppercase font-black text-[10px]">
                        <ShoppingBag size={14} /> Vendas ({entradasProcessadas.length})
                    </div>
                    <div className="bg-white rounded-[1.5rem] md:rounded-3xl border shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm min-w-[600px]">
                                <thead className="bg-zinc-50 border-b text-[9px] font-black text-zinc-400 uppercase">
                                    <tr>
                                        <th className="p-4">Mesa</th>
                                        <th className="p-4">Banco</th>
                                        <th className="p-4">Forma</th>
                                        <th className="p-4 text-right">Valor</th>
                                        <th className="p-4 w-12"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {entradasProcessadas.map((l: any) => (
                                        <tr key={l.id} className="hover:bg-zinc-50 transition-colors">
                                            <td className="p-4 font-bold">MESA {l.mesa || '--'}</td>
                                            <td className="p-4 font-black text-[9px] text-zinc-400 uppercase">{l.banco}</td>
                                            <td className="p-4 font-bold text-zinc-500 uppercase text-[9px]">
                                                {l.formaPagamento} {l.valorCaixinha > 0 && <span className="text-pink-500 ml-1">♥</span>}
                                            </td>
                                            <td className="p-4 text-right font-mono font-black text-zinc-900">R$ {l.valor.toFixed(2)}</td>
                                            <td className="p-4 text-right">
                                                <button onClick={() => onRemoverLancamento(l.id)} className="text-zinc-200 hover:text-red-500 p-2"><Trash2 size={18} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Sangrias */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 px-2 text-red-400 uppercase font-black text-[10px]">
                        <Wallet2 size={14} /> Sangrias
                    </div>
                    <div className="bg-red-50/30 rounded-[1.5rem] border border-red-100 overflow-hidden shadow-sm">
                        <table className="w-full text-left text-sm">
                            <tbody className="divide-y divide-red-100">
                                {sangrias.length === 0 ? (
                                    <tr><td className="p-8 text-center text-zinc-400 text-xs italic font-medium">Nenhuma sangria registrada</td></tr>
                                ) : (
                                    sangrias.map((l: any) => (
                                        <tr key={l.id}>
                                            <td className="p-4 italic font-bold text-red-900 text-xs">{l.identificacao}</td>
                                            <td className="p-4 text-right font-mono font-black text-red-600">R$ -{l.valor.toFixed(2)}</td>
                                            <td className="p-4 w-12 text-right">
                                                <button onClick={() => onRemoverLancamento(l.id)} className="text-red-200 hover:text-red-600 p-2"><Trash2 size={18} /></button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* TABELA DE CAIXINHAS ABAIXO DAS SANGRIAS */}
                <CaixinhasTable lancamentos={loteAtivo.lancamentos} />

            </div>
        </div>
    );
}