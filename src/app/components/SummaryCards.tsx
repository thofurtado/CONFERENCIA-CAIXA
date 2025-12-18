"use client"
import { Banknote, Coffee, Building2, CreditCard, Smartphone, Landmark, Heart } from 'lucide-react';

const BANCOS_DIGITAIS = ['SAFRA', 'PAGBANK', 'CIELO'] as const;
const FORMAS_CASA = ['Funcionário', 'Pró-labore', 'Cortesia', 'Permuta'] as const;

export function SummaryCards({ resumo }: { resumo: any }) {
  const safeGet = (obj: any, path: string) => {
    const value = path.split('.').reduce((acc, part) => acc && acc[part], obj);
    return typeof value === 'number' ? value : 0;
  };

  // Soma de todas as caixinhas recebidas (em todos os bancos + dinheiro)
  const totalCaixinha = safeGet(resumo, 'GERAL.totalCaixinha');

  const totalPorForma = (forma: string) => {
    return BANCOS_DIGITAIS.reduce((acc, banco) => acc + safeGet(resumo, `${banco}.${forma}`), 0);
  };

  const abertura = safeGet(resumo, 'CAIXA.saldoAbertura');
  const entradasDinheiro = safeGet(resumo, 'CAIXA.entradasDinheiro');
  const saidasDinheiro = safeGet(resumo, 'CAIXA.totalSaidas');

  // O saldo final do caixa físico considera Dinheiro Vivo (Vendas - Saídas + Abertura)
  const saldoFinalDinheiro = abertura + entradasDinheiro - saidasDinheiro;

  return (
    <div className="space-y-4">
      {/* HEADER COMPACTO COM CAIXINHA */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 shadow-lg">
        <div className="flex flex-col md:flex-row items-center gap-4 justify-between">

          <div className="flex items-center gap-6 px-2">
            <div>
              <p className="text-[7px] font-black text-zinc-500 uppercase tracking-tighter italic">Vendas Líquidas</p>
              <p className="text-xs font-mono font-bold text-emerald-500">R$ {safeGet(resumo, 'GERAL.entradas').toFixed(2)}</p>
            </div>
            <div className="w-[1px] h-6 bg-zinc-800" />

            {/* NOVO: CAMPO DE CAIXINHA NO RESUMO GERAL */}
            <div>
              <p className="text-[7px] font-black text-pink-500 uppercase tracking-tighter flex items-center gap-1">
                <Heart size={8} fill="currentColor" /> Caixinhas
              </p>
              <p className="text-xs font-mono font-bold text-pink-200">R$ {totalCaixinha.toFixed(2)}</p>
            </div>

            <div className="w-[1px] h-6 bg-zinc-800" />
            <div>
              <p className="text-[7px] font-black text-blue-400 uppercase tracking-tighter italic">Total em Caixa</p>
              <p className="text-sm font-mono font-black text-white">R$ {(abertura + safeGet(resumo, 'GERAL.saldo')).toFixed(2)}</p>
            </div>
          </div>

          <div className="flex gap-2 border-t md:border-t-0 md:border-l border-zinc-800 pt-3 md:pt-0 md:pl-6">
            <div className="flex flex-col items-center px-3">
              <span className="text-[7px] font-bold text-zinc-500 uppercase mb-1 flex items-center gap-1"><Smartphone size={8} /> Pix</span>
              <span className="text-[10px] font-mono font-bold text-blue-400">{(totalPorForma('PIX')).toFixed(2)}</span>
            </div>
            <div className="flex flex-col items-center px-3">
              <span className="text-[7px] font-bold text-zinc-500 uppercase mb-1 flex items-center gap-1"><CreditCard size={8} /> Débito</span>
              <span className="text-[10px] font-mono font-bold text-zinc-300">{(totalPorForma('Débito')).toFixed(2)}</span>
            </div>
            <div className="flex flex-col items-center px-3">
              <span className="text-[7px] font-bold text-zinc-500 uppercase mb-1 flex items-center gap-1"><CreditCard size={8} /> Crédito</span>
              <span className="text-[10px] font-mono font-bold text-zinc-300">{(totalPorForma('Crédito')).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">

        {/* CAIXA FÍSICO (Abertura agora é enfatizada como editável no seu form) */}
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <Banknote size={32} className="absolute -right-2 -top-2 opacity-10 text-emerald-600 rotate-12" />
          <h2 className="font-black text-emerald-700 text-[9px] mb-3 flex items-center gap-2 uppercase tracking-tight">
            Fluxo Dinheiro (Espécie)
          </h2>
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-emerald-800 font-bold italic underline decoration-emerald-200">
              <span>Abertura*</span><span>{abertura.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[10px] text-emerald-800/60 font-medium"><span>Vendas Dinheiro</span><span>{entradasDinheiro.toFixed(2)}</span></div>
            <div className="flex justify-between text-[10px] text-red-500 font-bold"><span>Saídas/Sangria</span><span>-{saidasDinheiro.toFixed(2)}</span></div>
            <div className="pt-2 mt-1 border-t border-emerald-200 flex justify-between items-center">
              <span className="text-[9px] text-emerald-600 font-black uppercase tracking-tighter">Saldo Físico</span>
              <span className="text-sm font-mono font-black text-emerald-700">R$ {saldoFinalDinheiro.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* BANCOS DETALHADOS */}
        {BANCOS_DIGITAIS.map(banco => (
          <div key={banco} className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-sm">
            <h2 className="font-black text-zinc-400 text-[9px] mb-3 flex items-center gap-2 uppercase tracking-tight">
              <Landmark size={12} className="text-blue-500" /> {banco}
            </h2>
            <div className="space-y-1 text-[10px]">
              <div className="flex justify-between text-zinc-500"><span>Pix</span><span className="text-zinc-900 font-mono font-bold">{safeGet(resumo, `${banco}.PIX`).toFixed(2)}</span></div>
              <div className="flex justify-between text-zinc-500"><span>Débito</span><span className="text-zinc-900 font-mono font-bold">{safeGet(resumo, `${banco}.Débito`).toFixed(2)}</span></div>
              <div className="flex justify-between text-zinc-500"><span>Crédito</span><span className="text-zinc-900 font-mono font-bold">{safeGet(resumo, `${banco}.Crédito`).toFixed(2)}</span></div>

              {/* Opcional: Mostrar caixinha por banco se você tiver esse dado */}
              {safeGet(resumo, `${banco}.caixinha`) > 0 && (
                <div className="flex justify-between text-pink-500 font-bold italic"><span>Gorjeta</span><span>{safeGet(resumo, `${banco}.caixinha`).toFixed(2)}</span></div>
              )}

              <div className="pt-2 mt-1 border-t border-zinc-100 flex justify-between items-center">
                <span className="text-[8px] font-black text-zinc-300 uppercase">Líquido</span>
                <span className="text-sm font-mono font-black text-blue-600">{(safeGet(resumo, `${banco}.total`)).toFixed(2)}</span>
              </div>
            </div>
          </div>
        ))}

        {/* CASA */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-inner">
          <h2 className="font-black text-orange-500 text-[9px] mb-3 flex items-center gap-2 uppercase italic tracking-tight text-center">
            Consumo Interno
          </h2>
          <div className="space-y-1 text-[9px]">
            {FORMAS_CASA.map(forma => (
              <div key={forma} className="flex justify-between text-zinc-500 font-bold">
                <span>{forma}</span>
                <span className="text-zinc-300 font-mono">{safeGet(resumo, `CASA.${forma}`).toFixed(2)}</span>
              </div>
            ))}
            <div className="pt-2 mt-1 border-t border-zinc-800 flex justify-between items-center text-orange-500">
              <span className="text-[8px] font-black uppercase italic">Total</span>
              <span className="text-sm font-mono font-black italic">{safeGet(resumo, 'CASA.total').toFixed(2)}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}