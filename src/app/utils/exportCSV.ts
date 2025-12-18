export function exportarParaCSV(lotes: any[], filename = "relatorio-caixas.csv") {
    if (lotes.length === 0) return;

    // Cabeçalhos amigáveis para o Excel
    const headers = ["Data", "Período", "Status", "Abertura (R$)", "Entradas (R$)", "Saídas (R$)", "Saldo (R$)"];

    const rows = lotes.map(l => {
        const entradas = l.lancamentos?.filter((i: any) => !i.isSaida).reduce((acc: number, i: any) => acc + i.valor, 0) || 0;
        const saidas = l.lancamentos?.filter((i: any) => i.isSaida).reduce((acc: number, i: any) => acc + i.valor, 0) || 0;
        const abertura = l.saldoAbertura || 0;

        return [
            new Date(l.dataReferencia).toLocaleDateString('pt-BR', { timeZone: 'UTC' }),
            l.periodo,
            l.conferido ? "Conferido" : "Pendente",
            abertura.toFixed(2).replace('.', ','),
            entradas.toFixed(2).replace('.', ','),
            saidas.toFixed(2).replace('.', ','),
            (abertura + entradas - saidas).toFixed(2).replace('.', ',')
        ];
    });

    const csvContent = [headers.join(";"), ...rows.map(row => row.join(";"))].join("\n");
    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.setAttribute("href", URL.createObjectURL(blob));
    link.setAttribute("download", filename);
    link.click();
}