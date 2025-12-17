"use client"
import { useState, useEffect } from 'react';
import { Plus, ArrowLeft, Ban } from 'lucide-react';

export function TransactionForm({ onAdd }: { onAdd: (dados: any) => void }) {
    const [tipo, setTipo] = useState<'entrada' | 'saida'>('entrada');
    const [valor, setValor] = useState('');
    const [forma, setForma] = useState('Dinheiro');
    const [banco, setBanco] = useState('CAIXA');
    const [mesa, setMesa] = useState('');
    const [identificacao, setIdentificacao] = useState('');
    const [isCaixinha, setIsCaixinha] = useState(false);

    const formasContaCasa = ['Funcionário', 'Pró-labore', 'Cortesia', 'Permuta'];
    const formasEletronicas = ['PIX', 'Débito', 'Crédito'];
    const opcoesMesas = Array.from({ length: 200 }, (_, i) => i + 1);

    useEffect(() => {
        if (tipo === 'entrada') {
            if (forma === 'Dinheiro') setBanco('CAIXA');
            else if (formasContaCasa.includes(forma)) setBanco('CONTA DA CASA');
            else if (formasEletronicas.includes(forma)) {
                if (banco === 'CAIXA' || banco === 'CONTA DA CASA') setBanco('SAFRA');
            }
        } else {
            setBanco('CAIXA');
        }
    }, [forma, tipo]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!valor) return;

        onAdd({
            valor: parseFloat(valor),
            formaPagamento: tipo === 'saida' ? 'Sangria' : forma,
            banco: banco,
            mesa: tipo === 'saida' ? '' : mesa,
            identificacao: tipo === 'saida' ? identificacao : '',
            isCaixinha: tipo === 'saida' ? false : isCaixinha,
            isSaida: tipo === 'saida'
        });

        setValor('');
        setMesa('');
        setIdentificacao('');
        setIsCaixinha(false);
    };

    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <h2 className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">
                    {tipo === 'entrada' ? "Nova Venda" : "Saída de Caixa"}
                </h2>
                <button
                    type="button"
                    onClick={() => setTipo(tipo === 'entrada' ? 'saida' : 'entrada')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all border ${tipo === 'saida'
                            ? 'bg-zinc-100 text-zinc-600 border-zinc-200'
                            : 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100'
                        }`}
                >
                    {tipo === 'entrada' ? <><Ban size={14} /> Lançar Sangria</> : <><ArrowLeft size={14} /> Voltar para Entradas</>}
                </button>
            </div>

            <form onSubmit={handleSubmit} className={`p-5 rounded-3xl border shadow-sm flex flex-wrap items-end gap-4 transition-colors ${tipo === 'saida' ? 'bg-red-50/30 border-red-100' : 'bg-white border-zinc-200'}`}>
                <div className="w-full md:w-32">
                    <label className="text-[9px] font-black uppercase text-zinc-400 block mb-1">Valor R$</label>
                    <input type="number" step="0.01" required value={valor} onChange={e => setValor(e.target.value)} placeholder="0,00" className="w-full border border-zinc-200 rounded-xl p-3 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                {tipo === 'entrada' ? (
                    <>
                        <div className="w-full md:w-44">
                            <label className="text-[9px] font-black uppercase text-zinc-400 block mb-1">Forma</label>
                            <select value={forma} onChange={e => setForma(e.target.value)} className="w-full border border-zinc-200 rounded-xl p-3 text-sm font-bold outline-none bg-white">
                                <option value="Dinheiro">Dinheiro</option>
                                <option value="PIX">PIX</option>
                                <option value="Débito">Cartão Débito</option>
                                <option value="Crédito">Cartão Crédito</option>
                                <option value="Funcionário">Funcionário</option>
                                <option value="Pró-labore">Pró-labore</option>
                                <option value="Cortesia">Cortesia</option>
                                <option value="Permuta">Permuta</option>
                            </select>
                        </div>
                        <div className="w-full md:w-40">
                            <label className="text-[9px] font-black uppercase text-zinc-400 block mb-1">Destino</label>
                            <select disabled={forma === 'Dinheiro' || formasContaCasa.includes(forma)} value={banco} onChange={e => setBanco(e.target.value)} className="w-full border border-zinc-200 rounded-xl p-3 text-sm font-bold outline-none bg-white disabled:bg-zinc-100">
                                {forma === 'Dinheiro' ? <option value="CAIXA">CAIXA</option> :
                                    formasContaCasa.includes(forma) ? <option value="CONTA DA CASA">CONTA DA CASA</option> :
                                        <><option value="SAFRA">SAFRA</option><option value="PAGBANK">PAGBANK</option><option value="CIELO">CIELO</option></>}
                            </select>
                        </div>
                        <div className="w-full md:w-24">
                            <label className="text-[9px] font-black uppercase text-zinc-400 block mb-1">Mesa</label>
                            <select value={mesa} onChange={e => setMesa(e.target.value)} className="w-full border border-zinc-200 rounded-xl p-3 text-sm font-bold outline-none bg-white font-bold">
                                <option value="">--</option>
                                {opcoesMesas.map(n => <option key={n} value={n}>{n}</option>)}
                            </select>
                        </div>
                        <div className="flex items-center gap-2 mb-3 px-2">
                            <input type="checkbox" id="caixinha" checked={isCaixinha} onChange={e => setIsCaixinha(e.target.checked)} className="w-4 h-4 rounded border-zinc-300 text-blue-600" />
                            <label htmlFor="caixinha" className="text-[10px] font-black uppercase text-zinc-500 cursor-pointer">Caixinha?</label>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 min-w-[200px]">
                        <label className="text-[9px] font-black uppercase text-zinc-400 block mb-1">Motivo da Sangria</label>
                        <input type="text" required value={identificacao} onChange={e => setIdentificacao(e.target.value)} placeholder="Ex: Fornecedor de Gás" className="w-full border border-red-200 rounded-xl p-3 text-sm font-bold outline-none focus:ring-2 focus:ring-red-500" />
                    </div>
                )}
                <div className="ml-auto">
                    <button type="submit" className={`px-8 h-[46px] flex items-center justify-center gap-2 text-white font-black uppercase text-[10px] rounded-xl transition-all shadow-md ${tipo === 'saida' ? 'bg-red-600 hover:bg-red-700' : 'bg-zinc-900 hover:bg-black'}`}>
                        <Plus size={16} /> {tipo === 'saida' ? 'Lançar Sangria' : 'Adicionar'}
                    </button>
                </div>
            </form>
        </div>
    );
}