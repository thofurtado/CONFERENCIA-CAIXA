"use client"
import { useEffect } from 'react';
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
    editarLancamento,
    editarAbertura,
    apagarLote,
    resumoLote
  } = useCaixa();

  // Atualiza o título da aba no navegador
  useEffect(() => {
    document.title = "Marujo | Eureca Tech";
  }, []);

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
      onEditarLancamento={editarLancamento}
      onEditarAbertura={editarAbertura}
    />
  );
}
