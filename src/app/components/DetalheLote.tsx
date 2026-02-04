"use client"
import { useState, useMemo } from 'react';
import { ArrowLeft, ShoppingBag, Trash2, Wallet2, Printer, Edit2, Check, X, Filter, CheckCircle2, AlertCircle, Clock, User, Eye, ChevronUp } from 'lucide-react';
import { SummaryCards } from './SummaryCards';
import { TransactionForm } from './TransactionForm';
import { CaixinhasTable } from './CaixinhasTable';
import { exportarLotePDF } from '../utils/exportPDF';

interface DetalheLoteProps {
    loteAtivo: any;
    resumoLote: any;
    onVoltar: () => void;
    onAdicionarLancamento: (l: any) => void;
    onRemoverLancamento: (id: string) => void;
    onEditarLancamento: (id: string, dadosAtualizados: any) => void;
    onEditarAbertura: (novoValor: number) => void;
    onAlterarStatus: (novoStatus: any) => void;
}

export function DetalheLote({
    loteAtivo,
    resumoLote,
    onVoltar,
    onAdicionarLancamento,
    onRemoverLancamento,
    onEditarLancamento,
    onEditarAbertura,
    onAlterarStatus
}: DetalheLoteProps) {
    const [filtro, setFiltro] = useState({ mesa: '', banco: '', forma: '' });
    const [sortConfig] = useState<{ key: string; direction: 'asc' | 'desc' | null }>({ key: '', direction: null });
    const [editandoId, setEditandoId] = useState<string | null>(null);
    const [dadosEdicao, setDadosEdicao] = useState<any>({});
    const [mostrarFiltros, setMostrarFiltros] = useState(false);
    const [editandoAbertura, setEditandoAbertura] = useState(false);
    const [valorAberturaTemp, setValorAberturaTemp] = useState('0');
    const [exibirSumario, setExibirSumario] = useState(false);

    const formasCasa = ['Funcionário', 'Pró-labore', 'Cortesia', 'Permuta'];

    const entradasRaw = loteAtivo.lancamentos.filter((l: any) => !l.isSaida && !formasCasa.includes(l.formaPagamento));
    const consumoCasaRaw = [...loteAtivo.lancamentos.filter((l: any) => formasCasa.includes(l.formaPagamento))].reverse();
    const sangrias = [...loteAtivo.lancamentos.filter((l: any) => l.isSaida)].reverse();

    const entradasProcessadas = useMemo(() => {
        let result = [...entradasRaw];
        if (filtro.mesa) result = result.filter(l => l.mesa?.toString().includes(filtro.mesa));
        if (filtro.banco) result = result.filter(l => l.banco.toLowerCase().includes(filtro.banco.toLowerCase()));
        if (filtro.forma) result = result.filter(l => l.formaPagamento.toLowerCase().includes(filtro.forma.toLowerCase()));

        if (sortConfig.key) {
            result.sort((a, b) => {
                const key = sortConfig.key as keyof typeof a;
                if (a[key] < b[key]) return sortConfig.direction === 'asc' ? -1 : 1;
                if (a[key] > b[key]) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        } else {
            result.reverse();
        }
        return result;
    }, [entradasRaw, filtro, sortConfig]);

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'conferido': return { label: 'Conferido', color: 'bg-green-100 text-green-700 border-green-200', icon: <CheckCircle2 size={14} /> };
            case 'alerta': return { label: 'Alerta', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: <AlertCircle size={14} /> };
            default: return { label: 'Pendente', color: 'bg-zinc-100 text-zinc-500 border-zinc-200', icon: <Clock size={14} /> };
        }
    };

    const alternarStatus = () => {
        const proximos: Record<string, string> = {
            'pendente': 'alerta',
            'alerta': 'conferido',
            'conferido': 'pendente'
        };
        onAlterarStatus(proximos[loteAtivo.status || 'pendente']);
    };

    const statusConfig = getStatusConfig(loteAtivo.status);

    const iniciarEdicao = (lancamento: any) => {
        setEditandoId(lancamento.id);
        setDadosEdicao({ ...lancamento });
    };

    const cancelarEdicao = () => {
        setEditandoId(null);
        setDadosEdicao({});
    };

    const salvarEdicao = () => {
        if (editandoId) {
            onEditarLancamento(editandoId, dadosEdicao);
            setEditandoId(null);
            setDadosEdicao({});
        }
    };

    const iniciarEdicaoAbertura = () => {
        setEditandoAbertura(true);
        setValorAberturaTemp(loteAtivo.valorAbertura.toString());
    };

    const salvarEdicaoAbertura = () => {
        onEditarAbertura(parseFloat(valorAberturaTemp) || 0);
        setEditandoAbertura(false);
    };

    return (
        <div className="min-h-screen bg-zinc-50 p-3 md:p-8 space-y-4 md:space-y-6 text-zinc-900">
            <header className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-2 md:gap-4">
                    <button onClick={onVoltar} className="p-3 bg-white border rounded-xl shadow-sm text-zinc-400 active:bg-zinc-100">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="font-black uppercase text-sm md:text-xl leading-none">
                                {new Date(loteAtivo.dataReferencia).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                            </h1>
                            <button
                                onClick={alternarStatus}
                                className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase transition-all active:scale-95 ${statusConfig.color}`}
                            >
                                {statusConfig.icon}
                                {statusConfig.label}
                            </button>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">{loteAtivo.periodo}</span>
                            <span className="text-[9px] font-bold text-zinc-400">•</span>
                            {editandoAbertura ? (
                                <div className="flex items-center gap-1">
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={valorAberturaTemp}
                                        onChange={e => setValorAberturaTemp(e.target.value)}
                                        className="w-24 text-[9px] font-bold px-2 py-1 border border-green-300 rounded bg-white"
                                        autoFocus
                                    />
                                    <button onClick={salvarEdicaoAbertura} className="text-green-600 p-1"><Check size={14} /></button>
                                    <button onClick={() => setEditandoAbertura(false)} className="text-red-600 p-1"><X size={14} /></button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-1 group cursor-pointer" onClick={iniciarEdicaoAbertura}>
                                    <span className="text-[9px] font-bold text-zinc-400">Abertura: R$ {Number(loteAtivo.valorAbertura).toFixed(2)}</span>
                                    <Edit2 size={10} className="text-zinc-300 group-hover:text-green-600 transition-colors" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <button onClick={() => exportarLotePDF(loteAtivo, resumoLote)} className="bg-zinc-900 text-white p-3 md:px-5 md:py-3 rounded-xl md:rounded-2xl font-black uppercase text-[10px] shadow-lg flex items-center gap-2 active:scale-95 transition-transform">
                    <Printer size={18} />
                    <span className="hidden md:inline">Exportar PDF</span>
                </button>
            </header>

            <div className="max-w-[1400px] mx-auto space-y-4 md:space-y-6">
                <button
                    onClick={() => setExibirSumario(!exibirSumario)}
                    className="w-full py-3 mb-4 bg-zinc-100/80 text-zinc-600 rounded-xl hover:bg-zinc-200 font-medium transition-colors flex items-center justify-center gap-2 uppercase text-xs tracking-wider"
                >
                    {exibirSumario ? (
                        <>
                            <ChevronUp size={16} /> Ocultar Painel
                        </>
                    ) : (
                        <>
                            <Eye size={16} /> Mostrar Painel de Conferência
                        </>
                    )}
                </button>

                {exibirSumario && <SummaryCards resumo={resumoLote} onEditAbertura={onEditarAbertura} />}
                <TransactionForm onAdd={onAdicionarLancamento} />

                <div className="space-y-2">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-2 text-zinc-400 uppercase font-black text-[10px]">
                            <ShoppingBag size={14} /> Vendas ({entradasProcessadas.length})
                        </div>
                        <button
                            onClick={() => setMostrarFiltros(!mostrarFiltros)}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-colors ${mostrarFiltros ? 'bg-blue-100 text-blue-600' : 'bg-zinc-100 text-zinc-400'}`}
                        >
                            <Filter size={12} /> Filtros
                        </button>
                    </div>

                    {mostrarFiltros && (
                        <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                                <label className="text-[9px] font-black uppercase text-zinc-400 block mb-1 ml-1">Mesa</label>
                                <input type="text" value={filtro.mesa} onChange={e => setFiltro({ ...filtro, mesa: e.target.value })} placeholder="Filtrar por mesa..." className="w-full border border-zinc-200 rounded-xl p-2 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
                            </div>
                            <div>
                                <label className="text-[9px] font-black uppercase text-zinc-400 block mb-1 ml-1">Banco</label>
                                <input type="text" value={filtro.banco} onChange={e => setFiltro({ ...filtro, banco: e.target.value })} placeholder="Filtrar por banco..." className="w-full border border-zinc-200 rounded-xl p-2 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
                            </div>
                            <div>
                                <label className="text-[9px] font-black uppercase text-zinc-400 block mb-1 ml-1">Forma</label>
                                <input type="text" value={filtro.forma} onChange={e => setFiltro({ ...filtro, forma: e.target.value })} placeholder="Filtrar por forma..." className="w-full border border-zinc-200 rounded-xl p-2 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
                            </div>
                        </div>
                    )}

                    <div className="bg-white rounded-[1.5rem] md:rounded-3xl border shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm min-w-[700px]">
                                <thead className="bg-zinc-50 border-b text-[9px] font-black text-zinc-400 uppercase">
                                    <tr>
                                        <th className="p-4">Mesa</th>
                                        <th className="p-4">Banco</th>
                                        <th className="p-4">Forma</th>
                                        <th className="p-4 text-right">Valor</th>
                                        <th className="p-4 w-24"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {entradasProcessadas.map((l: any) => (
                                        <tr key={l.id} className="hover:bg-zinc-50 transition-colors">
                                            {editandoId === l.id ? (
                                                <>
                                                    <td className="p-2"><input type="text" value={dadosEdicao.mesa || ''} onChange={e => setDadosEdicao({ ...dadosEdicao, mesa: e.target.value })} className="w-full px-2 py-1 border border-blue-300 rounded text-sm font-bold" /></td>
                                                    <td className="p-2">
                                                        <select value={dadosEdicao.banco} onChange={e => setDadosEdicao({ ...dadosEdicao, banco: e.target.value })} className="w-full px-2 py-1 border border-blue-300 rounded text-[9px] font-bold">
                                                            <option value="CAIXA">CAIXA</option>
                                                            <option value="SAFRA">SAFRA</option>
                                                            <option value="PAGBANK">PAGBANK</option>
                                                            <option value="CIELO">CIELO</option>
                                                            <option value="CONTA DA CASA">CONTA DA CASA</option>
                                                        </select>
                                                    </td>
                                                    <td className="p-2">
                                                        <select value={dadosEdicao.formaPagamento} onChange={e => setDadosEdicao({ ...dadosEdicao, formaPagamento: e.target.value })} className="w-full px-2 py-1 border border-blue-300 rounded text-[9px] font-bold">
                                                            <option value="Dinheiro">Dinheiro</option>
                                                            <option value="PIX">PIX</option>
                                                            <option value="Débito">Débito</option>
                                                            <option value="Crédito">Crédito</option>
                                                            <option value="Voucher">Voucher</option>
                                                        </select>
                                                    </td>
                                                    <td className="p-2"><input type="number" step="0.01" value={dadosEdicao.valor} onChange={e => setDadosEdicao({ ...dadosEdicao, valor: parseFloat(e.target.value) })} className="w-full px-2 py-1 border border-blue-300 rounded text-sm font-bold text-right" /></td>
                                                    <td className="p-2">
                                                        <div className="flex gap-1 justify-end">
                                                            <button onClick={salvarEdicao} className="text-green-600 p-1"><Check size={18} /></button>
                                                            <button onClick={cancelarEdicao} className="text-red-500 p-1"><X size={18} /></button>
                                                        </div>
                                                    </td>
                                                </>
                                            ) : (
                                                <>
                                                    <td className="p-4 font-bold"> M {l.mesa || '--'}</td>
                                                    <td className="p-4 font-black text-[9px] text-zinc-400 uppercase">{l.banco}</td>
                                                    <td className="p-4 font-bold text-zinc-500 uppercase text-[9px]">
                                                        {l.formaPagamento} {l.valorCaixinha > 0 && <span className="text-pink-500 ml-1">♥</span>}
                                                    </td>
                                                    <td className="p-4 text-right font-mono font-black text-zinc-900">R$ {l.valor.toFixed(2)}</td>
                                                    <td className="p-4">
                                                        <div className="flex gap-1 justify-end">
                                                            <button onClick={() => iniciarEdicao(l)} className="text-zinc-300 hover:text-blue-500 p-2"><Edit2 size={16} /></button>
                                                            <button onClick={() => onRemoverLancamento(l.id)} className="text-zinc-200 hover:text-red-500 p-2"><Trash2 size={18} /></button>
                                                        </div>
                                                    </td>
                                                </>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

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

                {consumoCasaRaw.length > 0 && (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 px-2 text-orange-500 uppercase font-black text-[10px]">
                            <User size={14} /> Consumo Casa / Colaboradores
                        </div>
                        <div className="bg-white rounded-[1.5rem] md:rounded-3xl border border-orange-100 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm min-w-[700px]">
                                    <thead className="bg-orange-50/50 border-b border-orange-100 text-[9px] font-black text-orange-400 uppercase">
                                        <tr>
                                            <th className="p-4">Consumidor</th>
                                            <th className="p-4">Tipo</th>
                                            <th className="p-4">Origem</th>
                                            <th className="p-4 text-right">Valor</th>
                                            <th className="p-4 w-24"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-orange-50">
                                        {consumoCasaRaw.map((l: any) => (
                                            <tr key={l.id} className="hover:bg-orange-50/30 transition-colors">
                                                <td className="p-4">
                                                    <span className="text-sm font-bold text-zinc-700">{l.consumidorCasa || 'Não informado'}</span>
                                                </td>
                                                <td className="p-4">
                                                    <span className="px-2 py-1 rounded-md bg-orange-100 text-orange-600 text-[9px] font-black uppercase">
                                                        {l.formaPagamento}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <span className="text-[9px] text-zinc-400 font-bold uppercase">{l.mesa ? `Mesa ${l.mesa}` : 'Balcão'}</span>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <span className="font-mono font-black text-orange-600">R$ {l.valor.toFixed(2)}</span>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <button onClick={() => onRemoverLancamento(l.id)} className="text-orange-200 hover:text-red-500 p-2 transition-colors">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                <CaixinhasTable lancamentos={loteAtivo.lancamentos} />
            </div>
        </div>
    );
}