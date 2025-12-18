"use client"
import { useState, useEffect } from 'react';
import { Plus, ArrowLeft, TrendingDown, Heart, User } from 'lucide-react';

export function TransactionForm({ onAdd }: { onAdd: (dados: any) => void }) {
    const [tipo, setTipo] = useState<'entrada' | 'saida'>('entrada');
    const [valor, setValor] = useState('');
    const [valorCaixinha, setValorCaixinha] = useState('');
    const [paraQuem, setParaQuem] = useState('');
    const [forma, setForma] = useState('Dinheiro');
    const [banco, setBanco] = useState('CAIXA');
    const [mesa, setMesa] = useState('');
    const [identificacao, setIdentificacao] = useState('');
    const [isCaixinha, setIsCaixinha] = useState(false);

    const formasContaCasa = ['Funcionário', 'Pró-labore', 'Cortesia', 'Permuta'];
    // ADICIONADO: 'Voucher' agora faz parte das formas eletrônicas para liberar os bancos
    const formasEletronicas = ['PIX', 'Débito', 'Crédito', 'Voucher'];
    const opcoesMesas = Array.from({ length: 200 }, (_, i) => i + 1);

    useEffect(() => {
        if (tipo === 'entrada') {
            if (forma === 'Dinheiro') setBanco('CAIXA');
            else if (formasContaCasa.includes(forma)) setBanco('CONTA DA CASA');
            else if (formasEletronicas.includes(forma)) {
                // Se mudar para Voucher/Pix/Cartão e estiver em bancos inválidos, reseta para SAFRA
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
            valorCaixinha: isCaixinha ? parseFloat(valorCaixinha || '0') : 0,
            paraQuem: isCaixinha ? paraQuem : '',
            formaPagamento: tipo === 'saida' ? 'Sangria' : forma,
            banco: banco,
            mesa: tipo === 'saida' ? '' : mesa,
            identificacao: tipo === 'saida' ? identificacao : '',
            isCaixinha: tipo === 'saida' ? false : isCaixinha,
            isSaida: tipo === 'saida'
        });

        setValor('');
        setValorCaixinha('');
        setParaQuem('');
        setMesa('');
        setIdentificacao('');
        setIsCaixinha(false);
    };

    return (
        <div className="space-y-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 px-1">
                <h2 className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">
                    {tipo === 'entrada' ? "Lançar Venda" : "Lançar Sangria"}
                </h2>
                <button
                    type="button"
                    onClick={() => setTipo(tipo === 'entrada' ? 'saida' : 'entrada')}
                    className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase transition-all border ${tipo === 'saida'
                        ? 'bg-zinc-100 text-zinc-600 border-zinc-200'
                        : 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100'
                        }`}
                >
                    {tipo === 'entrada' ? <><TrendingDown size={14} /> Registrar Sangria</> : <><ArrowLeft size={14} /> Voltar para Vendas</>}
                </button>
            </div>

            <form onSubmit={handleSubmit} className={`p-4 md:p-5 rounded-[1.5rem] md:rounded-3xl border shadow-sm flex flex-col transition-colors ${tipo === 'saida' ? 'bg-red-50/30 border-red-100' : 'bg-white border-zinc-200'}`}>

                <div className="flex flex-col md:flex-row items-stretch md:items-end gap-4">
                    <div className="grid grid-cols-2 md:flex md:flex-row gap-4 flex-1">
                        <div className="col-span-1 md:w-32">
                            <label className="text-[9px] font-black uppercase text-zinc-400 block mb-1 ml-1">Valor Total R$</label>
                            <input type="number" step="0.01" required value={valor} onChange={e => setValor(e.target.value)} placeholder="0,00" className="w-full border border-zinc-200 rounded-xl p-4 md:p-3 text-base md:text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 bg-zinc-50/50" />
                        </div>

                        {tipo === 'entrada' ? (
                            <>
                                <div className="col-span-1 md:w-24">
                                    <label className="text-[9px] font-black uppercase text-zinc-400 block mb-1 ml-1">Mesa</label>
                                    <select value={mesa} onChange={e => setMesa(e.target.value)} className="w-full border border-zinc-200 rounded-xl p-4 md:p-3 text-base md:text-sm font-bold outline-none bg-zinc-50/50">
                                        <option value="">--</option>
                                        {opcoesMesas.map(n => <option key={n} value={n}>{n}</option>)}
                                    </select>
                                </div>
                                <div className="col-span-2 md:w-44">
                                    <label className="text-[9px] font-black uppercase text-zinc-400 block mb-1 ml-1">Forma de Pagamento</label>
                                    <select value={forma} onChange={e => setForma(e.target.value)} className="w-full border border-zinc-200 rounded-xl p-4 md:p-3 text-base md:text-sm font-bold outline-none bg-zinc-50/50">
                                        <option value="Dinheiro">Dinheiro</option>
                                        <option value="PIX">PIX</option>
                                        <option value="Débito">Débito</option>
                                        <option value="Crédito">Crédito</option>
                                        <option value="Voucher">Voucher</option> {/* ADICIONADO AQUI */}
                                        <option value="Funcionário">Funcionário</option>
                                        <option value="Pró-labore">Pró-labore</option>
                                        <option value="Cortesia">Cortesia</option>
                                        <option value="Permuta">Permuta</option>
                                    </select>
                                </div>
                                <div className="col-span-2 md:w-40">
                                    <label className="text-[9px] font-black uppercase text-zinc-400 block mb-1 ml-1">Banco / Destino</label>
                                    <select
                                        disabled={forma === 'Dinheiro' || formasContaCasa.includes(forma)}
                                        value={banco}
                                        onChange={e => setBanco(e.target.value)}
                                        className="w-full border border-zinc-200 rounded-xl p-4 md:p-3 text-base md:text-sm font-bold outline-none bg-zinc-50/50 disabled:opacity-60"
                                    >
                                        {forma === 'Dinheiro' ? <option value="CAIXA">CAIXA</option> :
                                            formasContaCasa.includes(forma) ? <option value="CONTA DA CASA">CONTA DA CASA</option> :
                                                <>
                                                    <option value="SAFRA">SAFRA</option>
                                                    <option value="PAGBANK">PAGBANK</option>
                                                    <option value="CIELO">CIELO</option>
                                                </>
                                        }
                                    </select>
                                </div>
                            </>
                        ) : (
                            <div className="col-span-2 flex-1">
                                <label className="text-[9px] font-black uppercase text-zinc-400 block mb-1 ml-1">Motivo / Identificação</label>
                                <input type="text" required value={identificacao} onChange={e => setIdentificacao(e.target.value)} placeholder="Ex: Gás, Limpeza, etc." className="w-full border border-red-200 rounded-xl p-4 md:p-3 text-base md:text-sm font-bold outline-none focus:ring-2 focus:ring-red-500 bg-red-50/50" />
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-4 mt-2 md:mt-0">
                        {tipo === 'entrada' && (
                            <label className={`flex items-center gap-2 cursor-pointer px-4 py-3 rounded-xl border transition-all w-full md:w-auto justify-center ${isCaixinha ? 'bg-pink-50 border-pink-200' : 'bg-zinc-50 border-zinc-100'}`}>
                                <input type="checkbox" checked={isCaixinha} onChange={e => setIsCaixinha(e.target.checked)} className="w-5 h-5 rounded-lg text-pink-600 focus:ring-0" />
                                <span className={`text-[10px] font-black uppercase ${isCaixinha ? 'text-pink-600' : 'text-zinc-600'}`}>Caixinha?</span>
                            </label>
                        )}
                        <button type="submit" className={`w-full md:w-auto px-10 py-5 md:py-3 h-auto md:h-[46px] flex items-center justify-center gap-2 text-white font-black uppercase text-xs md:text-[10px] rounded-xl transition-all shadow-lg active:scale-95 ${tipo === 'saida' ? 'bg-red-600' : 'bg-zinc-900'}`}>
                            <Plus size={18} /> {tipo === 'saida' ? 'Lançar Sangria' : 'Adicionar'}
                        </button>
                    </div>
                </div>

                {tipo === 'entrada' && isCaixinha && (
                    <div className="mt-4 pt-4 border-t border-dashed border-pink-100 grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-2">
                        <div>
                            <label className="text-[9px] font-black uppercase text-pink-500 block mb-1 ml-1 flex items-center gap-1"><Heart size={8} fill="currentColor" /> Valor Gorjeta</label>
                            <input type="number" step="0.01" required value={valorCaixinha} onChange={e => setValorCaixinha(e.target.value)} placeholder="0,00" className="w-full border-2 border-pink-200 rounded-xl p-3 text-sm font-black outline-none focus:ring-2 focus:ring-pink-500 bg-white text-pink-700" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-[9px] font-black uppercase text-zinc-400 block mb-1 ml-1 flex items-center gap-1"><User size={8} /> Para quem é a caixinha?</label>
                            <input type="text" value={paraQuem} onChange={e => setParaQuem(e.target.value)} placeholder="Ex: João, Cozinha, Garçons..." className="w-full border border-zinc-200 rounded-xl p-3 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 bg-zinc-50/50" />
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
}