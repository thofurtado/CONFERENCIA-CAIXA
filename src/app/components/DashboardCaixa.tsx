"use client"
import { useState } from 'react';
import { Anchor, Plus, Clock, Trash2, Download, FileSpreadsheet } from 'lucide-react';
import { exportarParaCSV } from '../utils/exportCSV';
// Importe suas funções de exportação aqui
// import { exportarParaCSV } from './seu-arquivo';

interface DashboardProps {
    lotes: any[];
    onCriarNovo: (data: string, periodo: string, abertura: number) => void;
    onSelecionar: (id: string) => void;
    onApagar: (id: string) => void;
}

export function DashboardCaixa({ lotes, onCriarNovo, onSelecionar, onApagar }: DashboardProps) {
    const [novaData, setNovaData] = useState(new Date().toISOString().split('T')[0]);
    const [novoPeriodo, setNovoPeriodo] = useState('Almoço');
    const [saldoAbertura, setSaldoAbertura] = useState('0.00');

    const formatarDataBR = (dataString: string) => {
        const [ano, mes, dia] = dataString.split('-');
        return `${dia}/${mes}/${ano}`;
    };

    const handleCriar = () => {
        const existe = lotes.find(l => l.dataReferencia === novaData && l.periodo === novoPeriodo);
        if (existe) {
            alert(`Já existe um caixa de ${novoPeriodo} para este dia.`);
            return;
        }
        onCriarNovo(novaData, novoPeriodo, parseFloat(saldoAbertura) || 0);
        setSaldoAbertura('0.00');
    };

    return (
        <div className="min-h-screen bg-zinc-50 p-4 md:p-6 text-zinc-900 flex flex-col">
            <div className="max-w-5xl mx-auto space-y-6 flex-1 w-full">
                <header className="flex items-center gap-4 mb-8">
                    <div className="bg-zinc-900 p-3 rounded-2xl text-white shadow-xl">
                        <Anchor size={32} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tighter leading-none">Marujo</h1>
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">Conferência</span>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Seção Criar Novo */}
                    <div className="lg:col-span-4 bg-white p-6 rounded-[2rem] border shadow-sm self-start">
                        <h2 className="text-[10px] font-black uppercase text-zinc-400 mb-6 flex items-center gap-2">
                            <Plus size={14} className="text-blue-600" /> Abrir Novo Caixa
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[9px] font-bold text-zinc-400 uppercase ml-2 mb-1 block">Data</label>
                                <input type="date" value={novaData} onChange={e => setNovaData(e.target.value)} className="w-full border rounded-xl p-3 font-bold bg-zinc-50 border-zinc-100 outline-none" />
                            </div>
                            <div>
                                <label className="text-[9px] font-bold text-zinc-400 uppercase ml-2 mb-1 block">Período</label>
                                <select value={novoPeriodo} onChange={e => setNovoPeriodo(e.target.value)} className="w-full border rounded-xl p-3 font-bold bg-zinc-50 border-zinc-100">
                                    <option value="Almoço">Almoço</option>
                                    <option value="Jantar">Jantar</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[9px] font-bold text-zinc-400 uppercase ml-2 mb-1 block text-green-600">Abertura em Dinheiro</label>
                                <input type="number" value={saldoAbertura} onChange={e => setSaldoAbertura(e.target.value)} className="w-full border rounded-xl p-3 font-mono font-bold bg-zinc-50 border-zinc-100 outline-none text-green-700" />
                            </div>
                            <button onClick={handleCriar} className="w-full bg-blue-600 text-white font-black uppercase text-[10px] py-4 rounded-xl shadow-lg hover:opacity-90 transition-opacity">Iniciar Expediente</button>
                        </div>
                    </div>

                    {/* Seção Histórico */}
                    <div className="lg:col-span-8 bg-white rounded-[2rem] border shadow-sm overflow-hidden flex flex-col">
                        <div className="bg-zinc-50/50 px-6 py-4 border-b flex justify-between items-center">
                            <span className="font-black text-[10px] text-zinc-400 uppercase tracking-widest">Histórico Recente</span>

                            {/* BOTÃO EXPORTAR TODOS RECOLOCADO */}
                            <button
                                onClick={() => exportarParaCSV(lotes, "relatorio-geral.csv")}
                                className="flex items-center gap-2 text-[10px] font-black text-blue-600 bg-white border border-blue-100 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                            >
                                <FileSpreadsheet size={14} /> Exportar Todos
                            </button>
                        </div>

                        <div className="overflow-y-auto max-h-[500px] divide-y">
                            {lotes.map(l => (
                                <div key={l.id} className="px-6 py-4 flex justify-between items-center hover:bg-zinc-50 transition-colors group">
                                    <div className="flex items-center gap-4 cursor-pointer flex-1" onClick={() => onSelecionar(l.id)}>
                                        <Clock size={20} className="text-amber-500" />
                                        <div>
                                            <p className="font-black text-zinc-800 text-base">{formatarDataBR(l.dataReferencia)}</p>
                                            <div className="flex gap-2">
                                                <span className="text-[9px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{l.periodo}</span>
                                                <span className="text-[9px] font-bold text-zinc-400">Abertura: R$ {Number(l.valorAbertura).toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        {/* BOTÃO EXPORTAR ÚNICO (DETALHADO) */}
                                        <button
                                            onClick={(e) => { e.stopPropagation(); exportarParaCSV([l], `caixa-${l.dataReferencia}.csv`); }}
                                            className="text-zinc-300 hover:text-green-600 p-2 transition-colors"
                                            title="Exportar Detalhes"
                                        >
                                            <Download size={18} />
                                        </button>

                                        <button
                                            onClick={(e) => { e.stopPropagation(); onApagar(l.id); }}
                                            className="text-zinc-300 hover:text-red-500 p-2 transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}