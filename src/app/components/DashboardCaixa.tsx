"use client"
import { useState } from 'react';
import { ClipboardCheck, Plus, CheckCircle2, Clock, Trash2 } from 'lucide-react';

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
        <div className="min-h-screen bg-zinc-50 p-6 text-zinc-900">
            <div className="max-w-5xl mx-auto space-y-6">
                <header className="flex items-center gap-2 mb-8">
                    <ClipboardCheck className="text-blue-600" size={28} />
                    <h1 className="text-xl font-black uppercase tracking-tighter">Gestão de Caixa</h1>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* Lado Esquerdo: Novo Período */}
                    <div className="md:col-span-4 bg-white p-6 rounded-3xl border shadow-sm self-start">
                        <h2 className="text-[10px] font-black uppercase text-zinc-400 mb-4 flex items-center gap-2">
                            <Plus size={14} /> Novo Período
                        </h2>
                        <div className="space-y-4">
                            <input type="date" value={novaData} onChange={e => setNovaData(e.target.value)} className="w-full border rounded-xl p-3 font-bold outline-none focus:ring-2 ring-blue-100" />
                            <select value={novoPeriodo} onChange={e => setNovoPeriodo(e.target.value)} className="w-full border rounded-xl p-3 font-bold outline-none focus:ring-2 ring-blue-100">
                                <option value="Almoço">Almoço</option>
                                <option value="Jantar">Jantar</option>
                            </select>
                            <button onClick={() => onCriarNovo(novaData, novoPeriodo)} className="w-full bg-blue-600 text-white font-black uppercase text-xs py-4 rounded-xl hover:bg-blue-700 transition-all">Iniciar Caixa</button>
                        </div>
                    </div>

                    {/* Lado Direito: Histórico Compacto com Scroll */}
                    <div className="md:col-span-8 bg-white rounded-3xl border shadow-sm overflow-hidden flex flex-col">
                        <div className="bg-zinc-50 px-5 py-3 border-b font-black text-[10px] text-zinc-400 uppercase flex justify-between">
                            <span>Histórico de Períodos</span>
                            <span>{lotes.length} Registros</span>
                        </div>

                        {/* Container com Scroll Horizontal e Vertical */}
                        <div className="overflow-x-auto overflow-y-auto max-h-[600px]">
                            <div className="divide-y min-w-[500px]"> {/* min-w força o scroll horizontal antes de quebrar */}
                                {lotes.map(l => (
                                    <div
                                        key={l.id}
                                        onClick={() => onSelecionar(l.id)}
                                        className="px-5 py-3 flex justify-between items-center hover:bg-zinc-50 cursor-pointer group transition-colors"
                                    >
                                        <div className="flex items-center gap-4 flex-1">
                                            {/* Status */}
                                            {l.conferido ? <CheckCircle2 size={18} className="text-green-500 shrink-0" /> : <Clock size={18} className="text-amber-500 shrink-0" />}

                                            {/* Linha Única Horizontal */}
                                            <div className="flex items-center gap-4 w-full">
                                                <p className="font-bold text-zinc-800 text-sm whitespace-nowrap">
                                                    {new Date(l.dataReferencia).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                                                </p>

                                                <div className="flex items-center gap-2">
                                                    <span className="text-[9px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded tracking-wider">
                                                        {l.periodo}
                                                    </span>
                                                    <span className="text-[9px] font-bold text-zinc-400 uppercase bg-zinc-100 px-1.5 py-0.5 rounded whitespace-nowrap">
                                                        {l.lancamentos?.length || 0} itens
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 shrink-0">
                                            <div className="text-right">
                                                <p className={`text-[9px] font-black uppercase ${l.conferido ? 'text-green-600' : 'text-amber-600'}`}>
                                                    {l.conferido ? 'Conferido' : 'Pendente'}
                                                </p>
                                            </div>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); if (confirm('Apagar este período?')) onApagar(l.id); }}
                                                className="text-zinc-200 hover:text-red-500 transition-colors p-1"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {lotes.length === 0 && (
                                    <div className="p-10 text-center text-zinc-400 text-sm italic font-medium">
                                        Nenhum caixa registrado ainda.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}