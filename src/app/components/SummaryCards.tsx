"use client"
import { Banknote, Gift, Coffee, Building2, ArrowUpCircle, ArrowDownCircle, Wallet } from 'lucide-react';

const BANCOS_DIGITAIS = ['SAFRA', 'PAGBANK', 'CIELO'] as const;
const FORMAS_BANCO = ['PIX', 'Débito', 'Crédito'] as const;
const FORMAS_CASA = ['Funcionário', 'Pró-labore', 'Cortesia', 'Permuta'] as const;

export function SummaryCards({ resumo }: { resumo: any }) {
  const safeGet = (obj: any, path: string) => {
    const value = path.split('.').reduce((acc, part) => acc && acc[part], obj);
    return typeof value === 'number' ? value : 0;
  };

  return (
    <div className="space-y-4">
      {/* BARRA GERAL: No mobile os itens se ajustam melhor ao toque */}
      <div className="bg-zinc-900 rounded-[1.5rem] p-4 flex flex-row items-center justify-between shadow-xl border border-zinc-800">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="bg-green-500/10 p-2 rounded-lg hidden sm:block">
            <ArrowUpCircle size={18} className="text-green-500" />
          </div>
          <div className="leading-tight">
            <p className="text-[8px] font-black text-zinc-500 uppercase tracking-wider">Entradas</p>
            <p className="text-xs md:text-sm font-mono font-bold text-white">R$ {safeGet(resumo, 'GERAL.entradas').toFixed(2)}</p>
          </div>
        </div>

        <div className="h-8 w-px bg-zinc-800" />

        <div className="flex items-center gap-2 md:gap-3">
          <div className="bg-red-500/10 p-2 rounded-lg hidden sm:block">
            <ArrowDownCircle size={18} className="text-red-500" />
          </div>
          <div className="leading-tight text-right sm:text-left">
            <p className="text-[8px] font-black text-zinc-500 uppercase tracking-wider">Saídas</p>
            <p className="text-xs md:text-sm font-mono font-bold text-white">R$ {safeGet(resumo, 'GERAL.saidas').toFixed(2)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-zinc-800 px-4 py-2 rounded-2xl border border-zinc-700">
          <Wallet size={16} className="text-blue-400 shrink-0" />
          <div className="leading-tight">
            <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest">Saldo</p>
            <p className="text-sm md:text-base font-mono font-black text-white">R$ {safeGet(resumo, 'GERAL.saldo').toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {/* CAIXA FÍSICO: Destaque total (ocupa 2 colunas no mobile para legibilidade) */}
        <div className="col-span-2 md:col-span-1 bg-white border-2 border-green-500 rounded-[1.5rem] p-4 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="font-black text-green-600 text-[10px] mb-3 flex items-center gap-2 uppercase tracking-tight italic">
              <Banknote size={14} /> Caixa Físico
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold">
                <span className="text-zinc-400 uppercase tracking-tighter">Em Espécie</span>
                <span className="font-mono text-zinc-600">{(safeGet(resumo, 'CAIXA.Dinheiro') + safeGet(resumo, 'CAIXA.totalSaidas')).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[10px] font-bold text-red-500 italic">
                <span>(-) Saídas</span>
                <span className="font-mono">-{safeGet(resumo, 'CAIXA.totalSaidas').toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[12px] font-black pt-2 border-t border-zinc-100">
                <span className="text-zinc-900 uppercase">Saldo Final</span>
                <span className="font-mono text-green-600">R$ {safeGet(resumo, 'CAIXA.Dinheiro').toFixed(2)}</span>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-2 border-t border-dashed border-zinc-100 flex justify-between items-center bg-yellow-50/50 -mx-4 -mb-4 px-4 py-3 rounded-b-[1.3rem]">
            <span className="text-[9px] font-black uppercase text-yellow-600">Caixinhas [C]</span>
            <span className="font-mono font-black text-yellow-700 text-[12px]">R$ {safeGet(resumo, 'CAIXA.caixinhasGeral').toFixed(2)}</span>
          </div>
        </div>

        {/* CONTA DA CASA: Ocupa 1 coluna no mobile */}
        <div className="col-span-1 bg-white border border-zinc-200 rounded-[1.5rem] p-4 shadow-sm flex flex-col">
          <h2 className="font-black text-purple-600 text-[10px] mb-3 flex items-center gap-1 uppercase tracking-tight italic">
            <Coffee size={14} /> Conta Casa
          </h2>
          <div className="space-y-1.5 flex-1">
            {FORMAS_CASA.map(f => (
              <div key={f} className="flex justify-between text-[9px] font-bold border-b border-zinc-50 pb-1">
                <span className="text-zinc-400 uppercase truncate pr-1">{f}</span>
                <span className="font-mono text-zinc-600">{safeGet(resumo, `CASA.${f}`).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-2 border-t border-purple-100 flex justify-between text-[10px] font-black">
            <span className="text-purple-900 uppercase text-[8px]">Subtotal</span>
            <span className="font-mono text-purple-600">R$ {FORMAS_CASA.reduce((acc, f) => acc + safeGet(resumo, `CASA.${f}`), 0).toFixed(2)}</span>
          </div>
        </div>

        {/* BANCOS DIGITAIS: Ocupam 1 coluna cada no mobile */}
        {BANCOS_DIGITAIS.map(nome => (
          <div key={nome} className="col-span-1 bg-white border border-zinc-200 rounded-[1.5rem] p-4 shadow-sm flex flex-col">
            <h2 className="font-black text-blue-600 text-[10px] mb-3 flex items-center gap-1 uppercase tracking-tight italic">
              <Building2 size={14} /> {nome}
            </h2>
            <div className="space-y-1.5 flex-1">
              {FORMAS_BANCO.map(forma => (
                <div key={forma} className="flex justify-between text-[9px] font-bold border-b border-zinc-50 pb-1">
                  <span className="text-zinc-400 uppercase">{forma}</span>
                  <span className="font-mono text-zinc-600">{safeGet(resumo, `${nome}.${forma}`).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-2 border-t border-zinc-100 flex justify-between text-[10px] font-black">
              <span className="text-zinc-900 uppercase text-[8px]">Subtotal</span>
              <span className="font-mono text-blue-700">R$ {safeGet(resumo, `${nome}.total`).toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}