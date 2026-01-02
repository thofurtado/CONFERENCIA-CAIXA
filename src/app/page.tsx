"use client"
import { useEffect } from 'react';
import { useCaixa } from './hooks/useCaixa';
import { DashboardCaixa } from './components/DashboardCaixa';
import { DetalheLote } from './components/DetalheLote';
import { StatusCaixa } from './types/caixa'; // Importe o tipo se necessário

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
    resumoLote,
    alterarStatus
  } = useCaixa();

  // Atualiza o título da aba no navegador
  useEffect(() => {
    document.title = "Marujo | Eureca Tech";
  }, []);

  // Se não houver lote selecionado, mostra o Dashboard
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

  // Se houver um lote ativo, mostra os detalhes dele
  return (
    <DetalheLote
      loteAtivo={loteAtivo}
      resumoLote={resumoLote}
      onVoltar={() => setLoteAtivoId(null)}
      onAdicionarLancamento={adicionarLancamento}
      onRemoverLancamento={removerLancamento}
      onEditarLancamento={editarLancamento}
      onEditarAbertura={editarAbertura}
      onAlterarStatus={(status) => alterarStatus(loteAtivo.id, status)}
    />
  );
}