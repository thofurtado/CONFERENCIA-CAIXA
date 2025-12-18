"use client"
import { Banknote, Coffee, Building2, ArrowUpCircle, ArrowDownCircle, Wallet } from 'lucide-react';

const BANCOS_DIGITAIS = ['SAFRA', 'PAGBANK', 'CIELO'] as const;
const FORMAS_CASA = ['Funcionário', 'Pró-labore', 'Cortesia', 'Permuta'] as const;

export function SummaryCards({ resumo }: { resumo: any }) {
  const safeGet = (obj: any, path: string) => {
    const value = path.split('.').reduce((acc, part) => acc && acc[part], obj);
    return typeof value === 'number' ? value : 0;
  };

  const totalPorForma = (forma: string) => {
    return BANCOS_DIGITAIS.reduce((acc, banco) => acc + safeGet(resumo, `${banco}.${forma}`), 0);
  };

  const abertura = safeGet(resumo, 'CAIXA.saldoAbertura');
  const entradasDinheiro = safeGet(resumo, 'CAIXA.entradasDinheiro'); // Valor das vendas em espécie no dia
  const saidasDinheiro = safeGet(resumo, 'CAIXA.totalSaidas');
  const saldoFinalDinheiro = abertura + entradasDinheiro - saidasDinheiro;

  return (
    <div className="space-y-4">
      <div className="bg-zinc-900 rounded-[1.5rem] p-4 shadow-xl border border-zinc-800">
        <div className="flex flex-row items-center justify-between mb-4 pb-4 border-b border-zinc-800">
          {/* Seção Entradas / Saídas / Saldo Geral */}
          <div className="flex flex-row gap-6">
            <div>
              <p className="text-[8px] font-black text-zinc-500 uppercase">Entradas</p>
              <p className="text-sm font-mono font-bold text-white">R$ {safeGet(resumo, 'GERAL.entradas').toFixed(2)}</p>
            </div>
            <div>
              <p className="text-[8px] font-black text-zinc-500 uppercase">Saídas</p>
              <p className="text-sm font-mono font-bold text-white">R$ {safeGet(resumo, 'GERAL.saidas').toFixed(2)}</p>
            </div>
          </div>
          <div className="bg-blue-600 px-4 py-2 rounded-xl text-center">
            <p className="text-[8px] font-black text-blue-100 uppercase">Saldo Total (Geral)</p>
            <p className="text-lg font-mono font-black text-white leading-tight">R$ {(abertura + safeGet(resumo, 'GERAL.saldo')).toFixed(2)}</p>
          </div>
        </div>

        {/* TOTAIS CONSOLIDADOS (O que você pediu: tudo junto sem banco) */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-zinc-800 p-2 rounded-xl text-center">
            <p className="text-[7px] font-black text-zinc-500 uppercase">PIX Total</p>
            <p className="text-[11px] font-mono font-bold text-blue-400">R$ {totalPorForma('PIX').toFixed(2)}</p>
          </div>
          <div className="bg-zinc-800 p-2 rounded-xl text-center">
            <p className="text-[7px] font-black text-zinc-500 uppercase">DÉB. Total</p>
            <p className="text-[11px] font-mono font-bold text-zinc-300">R$ {totalPorForma('Débito').toFixed(2)}</p>
          </div>
          <div className="bg-zinc-800 p-2 rounded-xl text-center">
            <p className="text-[7px] font-black text-zinc-500 uppercase">CRÉD. Total</p>
            <p className="text-[11px] font-mono font-bold text-zinc-300">R$ {totalPorForma('Crédito').toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {/* CAIXA FÍSICO COM CÁLCULO DE ABERTURA */}
        <div className="col-span-1 md:col-span-1 bg-white border-2 border-green-500 rounded-[1.5rem] p-4 shadow-sm">
          <h2 className="font-black text-green-600 text-[10px] mb-3 flex items-center gap-2 uppercase italic">
            <Banknote size={14} /> Caixa Físico
          </h2>
          <div className="space-y-1 text-[10px] font-bold">
            <div className="flex justify-between text-zinc-400"><span>Abertura</span><span>{abertura.toFixed(2)}</span></div>
            <div className="flex justify-between text-zinc-400"><span>(+) Vendas</span><span>{entradasDinheiro.toFixed(2)}</span></div>
            <div className="flex justify-between text-red-500 italic"><span>(-) Saídas</span><span>-{saidasDinheiro.toFixed(2)}</span></div>
            <div className="pt-2 border-t flex justify-between text-[12px] font-black text-green-600">
              <span>Final</span><span>R$ {saldoFinalDinheiro.toFixed(2)}</span>
            </div>
          </div>
        </div>
        {/* Resto dos cartões (Casa, Bancos...) */}
      </div>
    </div>
  );
}