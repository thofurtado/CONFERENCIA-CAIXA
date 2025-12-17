"use client"
import { useState } from 'react';
import { Anchor, Plus, CheckCircle2, Clock, Trash2, ShieldCheck, Download, FileSpreadsheet } from 'lucide-react';
import { exportarParaCSV } from '../utils/exportCSV';

interface DashboardProps {
    lotes: any[];
    onCriarNovo: (data: string, periodo: string) => void;
    onSelecionar: (id: string) => void;
    onApagar: (id: string) => void;
}

export function DashboardCaixa({ lotes, onCriarNovo, onSelecionar, onApagar }: DashboardProps) {
    const [novaData, setNovaData] = useState(new Date().toISOString().split('T')[0]);
    const [novoPeriodo, setNovoPeriodo] = useState('Almoço');

    return (
        <div className="min-h-screen bg-zinc-50 p-4 md:p-6 text-zinc-900 flex flex-col">
            <div className="max-w-5xl mx-auto space-y-6 flex-1 w-full">
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="bg-zinc-900 p-3 rounded-2xl text-white shadow-xl shadow-zinc-200">
                            <Anchor size={32} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black uppercase tracking-tighter leading-none text-zinc-900">Marujo</h1>
                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">Conferência</span>
                        </div>
                    </div>
                    <div className="text-left border-l pl-4 border-zinc-200">
                        <p className="text-[9px] font-black uppercase text-zinc-400">Responsável</p>
                        <p className="text-lg font-bold text-zinc-800 leading-none">Sara Shiva</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-4 bg-white p-6 rounded-[2rem] border shadow-sm self-start">
                        <h2 className="text-[10px] font-black uppercase text-zinc-400 mb-6 flex items-center gap-2">
                            <Plus size={14} className="text-blue-600" /> Abrir Novo Caixa
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[9px] font-bold text-zinc-400 uppercase ml-2 mb-1 block">Data do Movimento</label>
                                <input type="date" value={novaData} onChange={e => setNovaData(e.target.value)} className="w-full border rounded-xl p-3 font-bold bg-zinc-50 border-zinc-100 outline-none focus:ring-2 ring-blue-100" />
                            </div>
                            <div>
                                <label className="text-[9px] font-bold text-zinc-400 uppercase ml-2 mb-1 block">Período</label>
                                <select value={novoPeriodo} onChange={e => setNovoPeriodo(e.target.value)} className="w-full border rounded-xl p-3 font-bold bg-zinc-50 border-zinc-100 outline-none focus:ring-2 ring-blue-100">
                                    <option value="Almoço">Almoço</option>
                                    <option value="Jantar">Jantar</option>
                                </select>
                            </div>
                            <button onClick={() => onCriarNovo(novaData, novoPeriodo)} className="w-full bg-blue-600 text-white font-black uppercase text-[10px] py-4 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">Iniciar Expediente</button>
                        </div>
                    </div>

                    <div className="lg:col-span-8 bg-white rounded-[2rem] border shadow-sm overflow-hidden flex flex-col">
                        <div className="bg-zinc-50/50 px-6 py-4 border-b flex justify-between items-center">
                            <span className="font-black text-[10px] text-zinc-400 uppercase tracking-widest">Histórico Recente</span>

                            {/* Botão de Exportar Tudo */}
                            <button
                                onClick={() => exportarParaCSV(lotes, "historico-total-marujo.csv")}
                                className="flex items-center gap-2 bg-zinc-900 text-white px-3 py-1.5 rounded-lg font-black uppercase text-[9px] hover:bg-zinc-800 transition-all active:scale-95 shadow-sm"
                            >
                                <FileSpreadsheet size={12} />
                                Exportar Tudo (CSV)
                            </button>
                        </div>

                        <div className="overflow-y-auto max-h-[500px] divide-y">
                            {lotes.map(l => (
                                <div key={l.id} className="px-6 py-4 flex justify-between items-center hover:bg-zinc-50 cursor-pointer group transition-colors">
                                    <div className="flex items-center gap-4 flex-1" onClick={() => onSelecionar(l.id)}>
                                        {l.conferido ? <CheckCircle2 size={20} className="text-green-500" /> : <Clock size={20} className="text-amber-500" />}
                                        <div>
                                            <p className="font-black text-zinc-800 text-base">
                                                {new Date(l.dataReferencia).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                                            </p>
                                            <div className="flex gap-2 items-center">
                                                <span className="text-[9px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{l.periodo}</span>
                                                <span className="text-[9px] font-bold text-zinc-400 uppercase">{l.lancamentos?.length || 0} lançamentos</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1 md:gap-3">
                                        {/* Botão de Exportar Individual */}
                                        <button
                                            onClick={(e) => { e.stopPropagation(); exportarParaCSV([l], `caixa-${l.dataReferencia}-${l.periodo}.csv`); }}
                                            className="text-zinc-300 hover:text-blue-600 transition-colors p-2"
                                            title="Exportar CSV"
                                        >
                                            <Download size={18} />
                                        </button>

                                        <button
                                            onClick={(e) => { e.stopPropagation(); if (confirm('Apagar permanentemente?')) onApagar(l.id); }}
                                            className="text-zinc-300 hover:text-red-500 transition-colors p-2"
                                            title="Apagar Registro"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {lotes.length === 0 && <div className="p-12 text-center text-zinc-400 text-sm italic">Nenhum caixa encontrado.</div>}
                        </div>
                    </div>
                </div>
            </div>

            <footer className="max-w-5xl mx-auto w-full py-8 text-center mt-8">
                <p className="text-[10px] font-bold text-zinc-300 uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                    <ShieldCheck size={14} className="text-zinc-400" /> Eureca Tech — Thomás Furtado
                </p>
            </footer>
        </div>
    );
}