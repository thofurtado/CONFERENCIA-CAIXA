export function exportarParaCSV(lotes: any[], filename = "relatorio-caixas.csv") {
    if (lotes.length === 0) return;

    // Cabeçalhos limpos (Removido o ID)
    const headers = ["Data", "Período", "Status", "Lançamentos", "Entradas (R$)", "Saídas (R$)", "Saldo (R$)"];

    // Mapeamento dos dados
    const rows = lotes.map(l => {
        const entradas = l.lancamentos?.filter((i: any) => !i.isSaida).reduce((acc: number, i: any) => acc + i.valor, 0) || 0;
        const saidas = l.lancamentos?.filter((i: any) => i.isSaida).reduce((acc: number, i: any) => acc + i.valor, 0) || 0;

        return [
            new Date(l.dataReferencia).toLocaleDateString('pt-BR', { timeZone: 'UTC' }),
            l.periodo,
            l.conferido ? "Conferido" : "Pendente",
            l.lancamentos?.length || 0,
            entradas.toFixed(2).replace('.', ','),
            saidas.toFixed(2).replace('.', ','),
            (entradas - saidas).toFixed(2).replace('.', ',')
        ];
    });

    // Montagem do conteúdo com ponto e vírgula
    const csvContent = [
        headers.join(";"),
        ...rows.map(row => row.join(";"))
    ].join("\n");

    // \ufeff é essencial para o Excel reconhecer acentos (UTF-8)
    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}