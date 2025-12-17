import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportarLotePDF = (lote: any, resumo: any) => {
    const doc = new jsPDF();
    const dataFormatada = new Date(lote.dataReferencia).toLocaleDateString('pt-BR', { timeZone: 'UTC' });

    // --- CABEÇALHO IDENTIDADE VISUAL ---
    doc.setFillColor(30, 41, 59); // Azul Marinho Escuro (Marujo)
    doc.rect(0, 0, 210, 20, 'F');

    doc.setFontSize(10);
    doc.setTextColor(255);
    doc.text('MARUJO - RELATÓRIO DE CONFERÊNCIA DIÁRIA', 14, 13);

    // Título Principal
    doc.setTextColor(0);
    doc.setFontSize(22);
    doc.text(`Fechamento ${lote.periodo}`, 14, 35);

    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Data: ${dataFormatada}  |  Gerente Responsável: Sara`, 14, 43);

    // --- NOVO: RESUMO DE FLUXO (IGUAL À TELA ANTERIOR) ---
    doc.setFontSize(14);
    doc.setTextColor(37, 99, 235);
    doc.text('FLUXO DE CAIXA', 14, 55);

    autoTable(doc, {
        startY: 60,
        head: [['Total de Entradas', 'Total de Saídas', 'Saldo Líquido']],
        body: [[
            `R$ ${resumo.GERAL.entradas.toFixed(2)}`,
            `R$ ${resumo.GERAL.saidas.toFixed(2)}`,
            {
                content: `R$ ${resumo.GERAL.saldo.toFixed(2)}`,
                styles: { fontStyle: 'bold', textColor: [0, 0, 0] }
            }
        ]],
        theme: 'grid',
        headStyles: { fillColor: [241, 245, 249], textColor: [71, 85, 105], fontStyle: 'bold' },
        styles: { fontSize: 12, halign: 'center' }
    });

    // --- RESUMO POR BANCO/MÁQUINA ---
    const bancoY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.setTextColor(37, 99, 235);
    doc.text('RESUMO POR BANCO/MÁQUINA', 14, bancoY);

    const resumoData = [
        ['CAIXA (DINHEIRO)', `R$ ${resumo.CAIXA.Dinheiro.toFixed(2)}`, `Caixinhas: R$ ${resumo.CAIXA.caixinhasGeral.toFixed(2)}`],
        ['SAFRA', `R$ ${resumo.SAFRA.total.toFixed(2)}`, `PIX: ${resumo.SAFRA.PIX.toFixed(2)} | Déb: ${resumo.SAFRA.Débito.toFixed(2)} | Créd: ${resumo.SAFRA.Crédito.toFixed(2)}`],
        ['PAGBANK', `R$ ${resumo.PAGBANK.total.toFixed(2)}`, `PIX: ${resumo.PAGBANK.PIX.toFixed(2)} | Déb: ${resumo.PAGBANK.Débito.toFixed(2)} | Créd: ${resumo.PAGBANK.Crédito.toFixed(2)}`],
        ['CIELO', `R$ ${resumo.CIELO.total.toFixed(2)}`, `PIX: ${resumo.CIELO.PIX.toFixed(2)} | Déb: ${resumo.CIELO.Débito.toFixed(2)} | Créd: ${resumo.CIELO.Crédito.toFixed(2)}`],
        ['CONTA DA CASA', `R$ ${(resumo.CASA.Funcionário + resumo.CASA['Pró-labore'] + resumo.CASA.Cortesia + resumo.CASA.Permuta).toFixed(2)}`, `Pro-labore: ${resumo.CASA['Pró-labore'].toFixed(2)} | Cortesia: ${resumo.CASA.Cortesia.toFixed(2)}`],
    ];

    autoTable(doc, {
        startY: bancoY + 5,
        head: [['Origem', 'Total', 'Detalhamento']],
        body: resumoData,
        theme: 'striped',
        headStyles: { fillColor: [37, 99, 235] }
    });

    // --- DETALHAMENTO DE VENDAS (Correção do Símbolo do PIX) ---
    const vendasY = (doc as any).lastAutoTable.finalY + 15;
    doc.setTextColor(71, 85, 105);
    doc.text('DETALHAMENTO DE VENDAS', 14, vendasY);

    const vendasData = lote.lancamentos
        .filter((l: any) => !l.isSaida)
        .map((l: any) => [
            `MESA ${l.mesa || '--'}`,
            l.banco,
            // Substituído o emoji por [C] para evitar símbolos estranhos
            l.formaPagamento + (l.isCaixinha ? ' [C]' : ''),
            `R$ ${l.valor.toFixed(2)}`
        ]);

    autoTable(doc, {
        startY: vendasY + 5,
        head: [['Mesa', 'Banco', 'Forma', 'Valor']],
        body: vendasData,
        headStyles: { fillColor: [71, 85, 105] }
    });

    // --- SANGRIAS/SAÍDAS ---
    if (lote.lancamentos.some((l: any) => l.isSaida)) {
        const sangriaY = (doc as any).lastAutoTable.finalY + 15;
        doc.setTextColor(220, 38, 38);
        doc.text('SANGRIAS / SAÍDAS', 14, sangriaY);
        const sangriasData = lote.lancamentos
            .filter((l: any) => l.isSaida)
            .map((l: any) => [l.identificacao, `R$ -${l.valor.toFixed(2)}`]);

        autoTable(doc, {
            startY: sangriaY + 5,
            head: [['Descrição', 'Valor']],
            body: sangriasData,
            headStyles: { fillColor: [220, 38, 38] }
        });
    }

    // --- RODAPÉ DE ASSINATURA ---
    const bottomY = doc.internal.pageSize.height - 10;
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Desenvolvido por Eureca Tech (Thomás Furtado) para Cliente Marujo`, 14, bottomY);

    doc.save(`Marujo_${lote.periodo}_${dataFormatada}.pdf`);
};