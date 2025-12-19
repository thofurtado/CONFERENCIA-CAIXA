import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportarLotePDF = (lote: any, resumo: any) => {
    if (!resumo) return;

    const doc = new jsPDF();
    const formatarDataBR = (dataString: string) => {
        if (!dataString) return '--/--/----';
        const [ano, mes, dia] = dataString.split('-');
        return `${dia}/${mes}/${ano}`;
    };

    const fmt = (valor: number) =>
        valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    const dataFormatada = formatarDataBR(lote.dataReferencia);

    // --- CABEÇALHO ---
    doc.setFillColor(30, 41, 59);
    doc.rect(0, 0, 210, 25, 'F');
    doc.setFontSize(10);
    doc.setTextColor(255);
    doc.text('MARUJO - RELATÓRIO DE CONFERÊNCIA DE MOVIMENTO', 14, 15);

    doc.setTextColor(0);
    doc.setFontSize(24);
    doc.text(`${lote.periodo.toUpperCase()}`, 14, 40);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Data de Referência: ${dataFormatada}  |  Responsável: Sara`, 14, 48);

    // --- 1. RESUMO FINANCEIRO (QUADRO DE TOPO) ---
    autoTable(doc, {
        startY: 55,
        head: [['DINHEIRO EM ESPÉCIE (CAIXA)', 'ENTRADAS DIGITAIS', 'TOTAL GORJETAS', 'TOTAL SAÍDAS']],
        body: [[
            fmt(resumo.CAIXA.entradasDinheiro + resumo.CAIXA.saldoAbertura - resumo.CAIXA.totalSaidas),
            fmt(resumo.SAFRA.total + resumo.PAGBANK.total + resumo.CIELO.total),
            fmt(resumo.GERAL.totalCaixinha),
            fmt(resumo.CAIXA.totalSaidas)
        ]],
        theme: 'grid',
        headStyles: { fillColor: [30, 41, 59], halign: 'center' },
        styles: { fontSize: 11, halign: 'center', fontStyle: 'bold' }
    });

    // --- 2. DETALHAMENTO POR BANCO (PIX, DÉBITO, CRÉDITO, VOUCHER) ---
    const bancoY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.text('CONSOLIDADO POR OPERADORA / BANCO', 14, bancoY);

    const bancos = [
        { nome: 'SAFRA', dados: resumo.SAFRA },
        { nome: 'PAGBANK', dados: resumo.PAGBANK },
        { nome: 'CIELO', dados: resumo.CIELO }
    ];

    const bodyBancos = bancos.map(b => [
        b.nome,
        fmt(b.dados.PIX || 0),
        fmt(b.dados.Débito || 0),
        fmt(b.dados.Crédito || 0),
        fmt(b.dados.Voucher || 0),
        fmt(b.dados.caixinha || 0),
        { content: fmt(b.dados.total || 0), styles: { fontStyle: 'bold' } }
    ]);

    autoTable(doc, {
        startY: bancoY + 4,
        head: [['Operadora', 'PIX', 'Débito', 'Crédito', 'Voucher', 'Gorgetas', 'TOTAL']],
        body: bodyBancos,
        headStyles: { fillColor: [51, 65, 85] },
        styles: { fontSize: 8.5 },
        columnStyles: { 6: { fillColor: [248, 250, 252] } }
    });

    // --- 3. TABELA DE GORJETAS (CAIXINHAS) ---
    const caixinhaY = (doc as any).lastAutoTable.finalY + 10;
    doc.text('DETALHAMENTO DE GORJETAS (PARA QUEM?)', 14, caixinhaY);

    const caixinhas = lote.lancamentos.filter((l: any) => l.isCaixinha && l.valorCaixinha > 0);
    autoTable(doc, {
        startY: caixinhaY + 4,
        head: [['Mesa', 'Forma', 'Destinatário', 'Valor Gorjeta']],
        body: caixinhas.map((c: any) => [
            c.mesa || '--',
            c.formaPagamento,
            c.paraQuem || 'Não informado',
            fmt(c.valorCaixinha)
        ]),
        headStyles: { fillColor: [219, 39, 119] }, // Rosa
        styles: { fontSize: 9 }
    });

    // --- 4. TABELA DE SANGRIAS (SAÍDAS) ---
    const sangriaY = (doc as any).lastAutoTable.finalY + 10;
    doc.text('SANGRIAS E SAÍDAS DE CAIXA', 14, sangriaY);

    const sangrias = lote.lancamentos.filter((l: any) => l.isSaida);
    autoTable(doc, {
        startY: sangriaY + 4,
        head: [['Descrição / Identificação do Gasto', 'Valor Retirado']],
        body: sangrias.map((s: any) => [
            s.identificacao || s.descricao || 'Sangria Geral',
            fmt(s.valor)
        ]),
        headStyles: { fillColor: [185, 28, 28] }, // Vermelho
        styles: { fontSize: 9 },
        columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } }
    });

    // --- 5. MOVIMENTAÇÃO COMPLETA (TODOS OS CAMPOS) ---
    doc.addPage(); // Nova página para o log completo
    doc.text('LOG COMPLETO DE LANÇAMENTOS (ORDEM DE ENTRADA)', 14, 20);

    autoTable(doc, {
        startY: 25,
        head: [['Mesa', 'Tipo', 'Forma', 'Banco', 'Venda', 'Gorgeta', 'Total Lançado']],
        body: lote.lancamentos.map((l: any) => [
            l.mesa || '--',
            l.isSaida ? 'SAÍDA' : 'VENDA',
            l.isSaida ? '-' : l.formaPagamento,
            l.banco || 'CAIXA',
            fmt(l.isSaida ? l.valor : (l.valor - (l.valorCaixinha || 0))),
            fmt(l.valorCaixinha || 0),
            fmt(l.valor)
        ]),
        styles: { fontSize: 7.5 },
        headStyles: { fillColor: [71, 85, 105] },
        didParseCell: (data) => {
            if (data.row.raw[1] === 'SAÍDA' && data.section === 'body') {
                data.cell.styles.textColor = [185, 28, 28];
            }
        }
    });

    // --- RODAPÉ ---
    const totalPages = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(`Página ${i} de ${totalPages} - Marujo Tech`, 14, 287);
    }

    doc.save(`FECHAMENTO_MARUJO_${lote.periodo}_${dataFormatada}.pdf`);
};