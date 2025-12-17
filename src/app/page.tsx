"use client"
import { useCaixa } from './hooks/useCaixa';
import { DashboardCaixa } from './components/DashboardCaixa';
import { DetalheLote } from './components/DetalheLote';

export default function Home() {
  const {
    lotes,
    loteAtivo,
    setLoteAtivoId,
    criarNovoLote,
    adicionarLancamento,
    removerLancamento,
    apagarLote,
    resumoLote
  } = useCaixa();

  if (!loteAtivo) {
    return (
      <DashboardCaixa
        lotes={lotes}
        onCriarNovo={criarNovoLote}
        onSelecionar={setLoteAtivoId}
        onApagar={apagarLote}
      />
    );
  }

  return (
    <DetalheLote
      loteAtivo={loteAtivo}
      resumoLote={resumoLote}
      onVoltar={() => setLoteAtivoId(null)}
      onAdicionarLancamento={adicionarLancamento}
      onRemoverLancamento={removerLancamento}
    />
  );
}