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
    <div className="space-y-3">
      {/* BARRA GERAL COMPACTA */}
      <div className="bg-zinc-900 rounded-xl p-3 flex items-center justify-around shadow-lg border border-zinc-800">
        <div className="flex items-center gap-2">
          <ArrowUpCircle size={16} className="text-green-500"/>
          <div className="leading-tight">
            <p className="text-[7px] font-black text-zinc-500 uppercase">Entradas</p>
            <p className="text-xs font-mono font-bold text-white">R$ {safeGet(resumo, 'GERAL.entradas').toFixed(2)}</p>
          </div>
        </div>
        <div className="h-6 w-px bg-zinc-800" />
        <div className="flex items-center gap-2">
          <ArrowDownCircle size={16} className="text-red-500"/>
          <div className="leading-tight">
            <p className="text-[7px] font-black text-zinc-500 uppercase">Saídas</p>
            <p className="text-xs font-mono font-bold text-white">R$ {safeGet(resumo, 'GERAL.saidas').toFixed(2)}</p>
          </div>
        </div>
        <div className="h-6 w-px bg-zinc-800" />
        <div className="flex items-center gap-2 bg-zinc-800 px-3 py-1 rounded-lg">
          <Wallet size={16} className="text-blue-400"/>
          <div className="leading-tight">
            <p className="text-[7px] font-black text-blue-400 uppercase">Saldo Período</p>
            <p className="text-sm font-mono font-black text-white">R$ {safeGet(resumo, 'GERAL.saldo').toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {/* CAIXA FÍSICO COMPACTO */}
        <div className="bg-white border-2 border-green-500 rounded-xl p-3 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="font-black text-green-600 text-[9px] mb-2 flex items-center gap-1 uppercase tracking-tighter italic">
              <Banknote size={12}/> Caixa Físico
            </h2>
            <div className="space-y-1">
              <div className="flex justify-between text-[8px] font-bold">
                <span className="text-zinc-400 uppercase">Dinheiro</span>
                <span className="font-mono text-zinc-600">{(safeGet(resumo, 'CAIXA.Dinheiro') + safeGet(resumo, 'CAIXA.totalSaidas')).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[8px] font-bold text-red-500 italic">
                <span>(-) Saídas</span>
                <span className="font-mono">-{safeGet(resumo, 'CAIXA.totalSaidas').toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[10px] font-black pt-1 border-t border-zinc-100">
                <span className="text-zinc-900 uppercase">Saldo</span>
                <span className="font-mono">R$ {safeGet(resumo, 'CAIXA.Dinheiro').toFixed(2)}</span>
              </div>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-dashed border-zinc-100 flex justify-between items-center">
            <span className="text-[8px] font-black uppercase text-yellow-600">Caixinhas</span>
            <span className="font-mono font-black text-yellow-700 text-[10px]">R$ {safeGet(resumo, 'CAIXA.caixinhasGeral').toFixed(2)}</span>
          </div>
        </div>

        {/* CONTA DA CASA COMPACTA */}
        <div className="bg-white border-2 border-purple-500 rounded-xl p-3 shadow-sm flex flex-col">
          <h2 className="font-black text-purple-600 text-[9px] mb-2 flex items-center gap-1 uppercase tracking-tighter italic">
            <Coffee size={12}/> Conta da Casa
          </h2>
          <div className="space-y-0.5 flex-1">
            {FORMAS_CASA.map(f => (
              <div key={f} className="flex justify-between text-[8px] font-bold">
                <span className="text-zinc-400 uppercase">{f}</span>
                <span className="font-mono">R$ {safeGet(resumo, `CASA.${f}`).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 pt-1 border-t border-purple-100 flex justify-between text-[9px] font-black">
            <span className="text-purple-900 uppercase">Total</span>
            <span className="font-mono text-purple-600">R$ {FORMAS_CASA.reduce((acc, f) => acc + safeGet(resumo, `CASA.${f}`), 0).toFixed(2)}</span>
          </div>
        </div>

        {/* BANCOS COMPACTOS */}
        {BANCOS_DIGITAIS.map(nome => (
          <div key={nome} className="bg-white border border-zinc-200 rounded-xl p-3 shadow-sm flex flex-col">
            <h2 className="font-black text-blue-600 text-[9px] mb-2 flex items-center gap-1 uppercase tracking-tighter italic">
              <Building2 size={12}/> {nome}
            </h2>
            <div className="space-y-0.5 flex-1">
              {FORMAS_BANCO.map(forma => (
                <div key={forma} className="flex justify-between text-[8px] font-bold">
                  <span className="text-zinc-400 uppercase">{forma}</span>
                  <span className="font-mono">R$ {safeGet(resumo, `${nome}.${forma}`).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="mt-2 pt-1 border-t border-zinc-100 flex justify-between text-[9px] font-black">
              <span className="text-zinc-900 uppercase">Total</span>
              <span className="font-mono text-blue-700">R$ {safeGet(resumo, `${nome}.total`).toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}