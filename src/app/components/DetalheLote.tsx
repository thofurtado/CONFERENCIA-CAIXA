"use client"
import { useState, useMemo } from 'react';
import { ArrowLeft, ShoppingBag, ArrowUpDown, Trash2, Wallet2 } from 'lucide-react';
import { SummaryCards } from './SummaryCards';
import { TransactionForm } from './TransactionForm';

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
        <div className="min-h-screen bg-zinc-50 p-4 md:p-8 space-y-6 text-zinc-900">
            <header className="max-w-[1400px] mx-auto flex items-center gap-4">
                <button onClick={onVoltar} className="p-2 bg-white border rounded-xl hover:bg-zinc-100 transition-colors shadow-sm text-zinc-400">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="font-black uppercase text-xl leading-none">
                        {new Date(loteAtivo.dataReferencia).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                    </h1>
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{loteAtivo.periodo}</span>
                </div>
            </header>

            <div className="max-w-[1400px] mx-auto"><SummaryCards resumo={resumoLote} /></div>
            <div className="max-w-[1400px] mx-auto"><TransactionForm onAdd={onAdicionarLancamento} /></div>

            <div className="max-w-[1400px] mx-auto space-y-3">
                <div className="flex items-center gap-2 px-2 text-zinc-400 uppercase font-black text-[10px]">
                    <ShoppingBag size={14} /> Registro de Vendas ({entradasProcessadas.length})
                </div>
                <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-zinc-50 border-b text-[9px] font-black text-zinc-400 uppercase">
                            <tr>
                                <th className="p-4">
                                    <button onClick={() => toggleSort('mesa')} className="flex items-center gap-1 mb-1">Mesa <ArrowUpDown size={10} /></button>
                                    <input type="text" placeholder="Filtro" className="font-normal p-1 border rounded w-16 uppercase" value={filtro.mesa} onChange={e => setFiltro({ ...filtro, mesa: e.target.value })} />
                                </th>
                                <th className="p-4">
                                    <button onClick={() => toggleSort('banco')} className="flex items-center gap-1 mb-1">Banco <ArrowUpDown size={10} /></button>
                                    <input type="text" placeholder="Filtro" className="font-normal p-1 border rounded w-24 uppercase" value={filtro.banco} onChange={e => setFiltro({ ...filtro, banco: e.target.value })} />
                                </th>
                                <th className="p-4">
                                    <button onClick={() => toggleSort('formaPagamento')} className="flex items-center gap-1 mb-1">Forma <ArrowUpDown size={10} /></button>
                                    <input type="text" placeholder="Filtro" className="font-normal p-1 border rounded w-24 uppercase" value={filtro.forma} onChange={e => setFiltro({ ...filtro, forma: e.target.value })} />
                                </th>
                                <th className="p-4 text-right">
                                    <button onClick={() => toggleSort('valor')} className="flex items-center justify-end gap-1 w-full">Valor <ArrowUpDown size={10} /></button>
                                </th>
                                <th className="p-4 w-10"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {entradasProcessadas.map((l: any) => (
                                <tr key={l.id} className="hover:bg-zinc-50/50 transition-colors">
                                    <td className="p-4 font-bold">MESA {l.mesa || '--'}</td>
                                    <td className="p-4 font-black text-[10px] text-zinc-400 uppercase">{l.banco}</td>
                                    <td className="p-4 font-bold text-zinc-500 uppercase text-[10px]">{l.formaPagamento} {l.isCaixinha && "🎁"}</td>
                                    <td className="p-4 text-right font-mono font-black text-zinc-900">R$ {l.valor.toFixed(2)}</td>
                                    <td className="p-4 text-right">
                                        <button onClick={() => onRemoverLancamento(l.id)} className="text-zinc-200 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="max-w-[1400px] mx-auto space-y-3 pb-10">
                <div className="flex items-center gap-2 px-2 text-red-400 uppercase font-black text-[10px]">
                    <Wallet2 size={14} /> Sangrias
                </div>
                <div className="bg-red-50/30 rounded-3xl border border-red-100 overflow-hidden shadow-sm">
                    <table className="w-full text-left text-sm">
                        <tbody className="divide-y divide-red-100">
                            {sangrias.map((l: any) => (
                                /* AQUI ESTAVA O ERRO: Adicionada a key={l.id} */
                                <tr key={l.id}>
                                    <td className="p-4 italic font-medium text-red-900 text-xs">{l.identificacao}</td>
                                    <td className="p-4 text-right font-mono font-black text-red-600">
                                        R$ -{l.valor.toFixed(2)}
                                    </td>
                                    <td className="p-4 w-10 text-right">
                                        <button
                                            onClick={() => onRemoverLancamento(l.id)}
                                            className="text-red-200 hover:text-red-600 transition-colors pr-2"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}