import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportarLotePDF = (lote: any, resumo: any) => {
    if (!resumo) return;

    const doc = new jsPDF();

    // Correção para evitar Invalid Date
    const formatarDataBR = (dataString: string) => {
        if (!dataString) return '--/--/----';
        const [ano, mes, dia] = dataString.split('-');
        return `${dia}/${mes}/${ano}`;
    };
    const dataFormatada = formatarDataBR(lote.dataReferencia);

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

    // --- 1. FLUXO DE CAIXA (SUMÁRIO GERAL) ---
    doc.setFontSize(14);
    doc.setTextColor(37, 99, 235);
    doc.text('FLUXO DE CAIXA', 14, 55);

    autoTable(doc, {
        startY: 60,
        head: [['Vendas Líquidas', 'Total Caixinhas', 'Total Saídas', 'Saldo Líquido']],
        body: [[
            `R$ ${Number(resumo.GERAL.entradas || 0).toFixed(2).replace('.', ',')}`,
            `R$ ${Number(resumo.GERAL.totalCaixinha || 0).toFixed(2).replace('.', ',')}`,
            `R$ ${Number(resumo.CAIXA.totalSaidas || 0).toFixed(2).replace('.', ',')}`,
            {
                content: `R$ ${Number(resumo.GERAL.saldo || 0).toFixed(2).replace('.', ',')}`,
                styles: { fontStyle: 'bold', textColor: [0, 0, 0] }
            }
        ]],
        theme: 'grid',
        headStyles: { fillColor: [241, 245, 249], textColor: [71, 85, 105], fontStyle: 'bold' },
        styles: { fontSize: 10, halign: 'center' }
    });

    // --- 2. RESUMO POR BANCO/MÁQUINA ---
    const bancoY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.setTextColor(37, 99, 235);
    doc.text('RESUMO POR BANCO/MÁQUINA', 14, bancoY);

    const resumoData = [
        [
            'CAIXA (DINHEIRO)',
            `R$ ${Number(resumo.CAIXA.entradasDinheiro || 0).toFixed(2).replace('.', ',')}`,
            `Abertura: R$ ${Number(resumo.CAIXA.saldoAbertura || 0).toFixed(2).replace('.', ',')}`
        ],
        [
            'SAFRA',
            `R$ ${Number(resumo.SAFRA.total || 0).toFixed(2).replace('.', ',')}`,
            `PIX: ${resumo.SAFRA.PIX.toFixed(2)} | Déb: ${resumo.SAFRA.Débito.toFixed(2)} | Créd: ${resumo.SAFRA.Crédito.toFixed(2)} | Caixinha: ${resumo.SAFRA.caixinha.toFixed(2)}`
        ],
        [
            'PAGBANK',
            `R$ ${Number(resumo.PAGBANK.total || 0).toFixed(2).replace('.', ',')}`,
            `PIX: ${resumo.PAGBANK.PIX.toFixed(2)} | Déb: ${resumo.PAGBANK.Débito.toFixed(2)} | Créd: ${resumo.PAGBANK.Crédito.toFixed(2)} | Caixinha: ${resumo.PAGBANK.caixinha.toFixed(2)}`
        ],
        [
            'CIELO',
            `R$ ${Number(resumo.CIELO.total || 0).toFixed(2).replace('.', ',')}`,
            `PIX: ${resumo.CIELO.PIX.toFixed(2)} | Déb: ${resumo.CIELO.Débito.toFixed(2)} | Créd: ${resumo.CIELO.Crédito.toFixed(2)} | Caixinha: ${resumo.CIELO.caixinha.toFixed(2)}`
        ],
        [
            'CONTA DA CASA',
            `R$ ${Number(resumo.CASA.total || 0).toFixed(2).replace('.', ',')}`,
            `Func: ${resumo.CASA.Funcionário.toFixed(2)} | Pró-labore: ${resumo.CASA['Pró-labore'].toFixed(2)}`
        ],
    ];

    autoTable(doc, {
        startY: bancoY + 5,
        head: [['Origem', 'Total Líquido', 'Detalhamento (Vendas + Gorjetas)']],
        body: resumoData,
        theme: 'striped',
        headStyles: { fillColor: [37, 99, 235] },
        styles: { fontSize: 9 }
    });

    // --- 3. DETALHAMENTO DE VENDAS (INCLUINDO CAIXINHAS) ---
    const vendasY = (doc as any).lastAutoTable.finalY + 15;
    doc.setTextColor(71, 85, 105);
    doc.text('DETALHAMENTO DE VENDAS', 14, vendasY);

    const vendasData = (lote.lancamentos || [])
        .filter((l: any) => !l.isSaida)
        .map((l: any) => [
            `MESA ${l.mesa || '--'}`,
            l.banco || 'Dinheiro',
            l.formaPagamento + (Number(l.valorCaixinha) > 0 ? ' [+Gorgeta]' : ''),
            `R$ ${Number(l.valor - (l.valorCaixinha || 0)).toFixed(2).replace('.', ',')}`,
            `R$ ${Number(l.valorCaixinha || 0).toFixed(2).replace('.', ',')}`
        ]);

    autoTable(doc, {
        startY: vendasY + 5,
        head: [['Mesa', 'Banco/Origem', 'Forma', 'Venda Líquida', 'Caixinha']],
        body: vendasData,
        headStyles: { fillColor: [71, 85, 105] },
        styles: { fontSize: 8 },
        columnStyles: { 3: { halign: 'right' }, 4: { halign: 'right' } }
    });

    // --- 4. SANGRIAS / SAÍDAS ---
    const saídas = (lote.lancamentos || []).filter((l: any) => l.isSaida);

    if (saídas.length > 0) {
        const sangriaY = (doc as any).lastAutoTable.finalY + 15;
        doc.setTextColor(220, 38, 38);
        doc.text('SANGRIAS / SAÍDAS', 14, sangriaY);

        const sangriasData = saídas.map((l: any) => [
            l.descricao || l.identificacao || 'Saída / Sangria',
            `R$ ${Number(l.valor).toFixed(2).replace('.', ',')}`
        ]);

        autoTable(doc, {
            startY: sangriaY + 5,
            head: [['Descrição da Saída', 'Valor Pago']],
            body: sangriasData,
            headStyles: { fillColor: [220, 38, 38] },
            styles: { fontSize: 9 },
            columnStyles: { 1: { halign: 'right' } }
        });
    }

    // --- RODAPÉ ---
    const bottomY = doc.internal.pageSize.height - 10;
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Desenvolvido por Eureca Tech para Marujo Conferência`, 14, bottomY);

    doc.save(`Marujo_${lote.periodo}_${dataFormatada}.pdf`);
};