import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportarRelatorioGeralPDF = (lotes: any[]) => {
    const doc = new jsPDF('l', 'mm', 'a4');

    // Ordenação: Data crescente e Período (Almoço vira primeiro que Jantar)
    const lotesOrdenados = [...lotes].sort((a, b) => {
        const dataA = new Date(a.dataReferencia).getTime();
        const dataB = new Date(b.dataReferencia).getTime();
        if (dataA !== dataB) return dataA - dataB;
        return a.periodo === 'Almoço' ? -1 : 1;
    });

    doc.setFillColor(30, 41, 59);
    doc.rect(0, 0, 297, 20, 'F');
    doc.setFontSize(12);
    doc.setTextColor(255);
    doc.text('MARUJO - RELATÓRIO FINANCEIRO CONSOLIDADO', 14, 13);

    const body = lotesOrdenados.map(l => {
        const lanc = l.lancamentos || [];
        const abertura = Number(l.valorAbertura || 0);
        const entDin = lanc.filter((i: any) => !i.isSaida && i.formaPagamento === 'Dinheiro')
            .reduce((acc: number, i: any) => acc + (i.valor - (i.valorCaixinha || 0)), 0);
        const sai = lanc.filter((i: any) => i.isSaida).reduce((acc: number, i: any) => acc + i.valor, 0);
        const getSum = (forma: string) => lanc.filter((i: any) => !i.isSaida && i.formaPagamento === forma).reduce((acc: number, i: any) => acc + i.valor, 0);
        const consumo = lanc.filter((i: any) => !i.isSaida && ['Funcionário', 'Cortesia', 'Pró-labore'].includes(i.formaPagamento)).reduce((acc: number, i: any) => acc + i.valor, 0);
        const totalVendas = lanc.filter((i: any) => !i.isSaida).reduce((acc: number, i: any) => acc + i.valor, 0);

        return [
            l.dataReferencia.split('-').reverse().join('/'),
            l.periodo,
            abertura.toFixed(2),
            entDin.toFixed(2),
            sai.toFixed(2),
            (abertura + entDin - sai).toFixed(2),
            getSum('PIX').toFixed(2),
            getSum('Débito').toFixed(2),
            getSum('Crédito').toFixed(2),
            getSum('Voucher').toFixed(2),
            consumo.toFixed(2),
            totalVendas.toFixed(2),
            (totalVendas + abertura - sai).toFixed(2)
        ];
    });

    autoTable(doc, {
        startY: 25,
        head: [['Data', 'Período', 'Abertura', 'Ent. Din', 'Saídas', 'Sald. Din', 'PIX', 'Débito', 'Crédito', 'Voucher', 'Consumo', 'Total Vendas', 'Saldo Final']],
        body: body,
        theme: 'grid',
        styles: { fontSize: 7, halign: 'center' },
        headStyles: { fillColor: [30, 41, 59] },
    });

    doc.save(`Relatorio_Marujo_Geral.pdf`);
};