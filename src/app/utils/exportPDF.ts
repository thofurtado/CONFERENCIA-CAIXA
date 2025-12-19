import jsPDF from 'jspdf';
import autoTable, { RowInput } from 'jspdf-autotable';

const fmt = (valor: number) =>
    valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const formatarDataBR = (dataString: string) => {
    if (!dataString) return '--/--/----';
    const [ano, mes, dia] = dataString.split('-');
    return `${dia}/${mes}/${ano}`;
};

export const exportarLotePDF = (lote: any, resumo: any) => {
    if (!resumo) return;
    const doc = new jsPDF();
    const dataFormatada = formatarDataBR(lote.dataReferencia);

    // Cabeçalho e resumo inicial (mantido como estava)
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
    doc.text(`Data de Referência: ${dataFormatada}`, 14, 48);

    // Tabela de Resumo Superior
    autoTable(doc, {
        startY: 55,
        head: [['DINHEIRO EM ESPÉCIE', 'ENTRADAS DIGITAIS', 'TOTAL GORJETAS', 'TOTAL SAÍDAS']],
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

    const bancos = [
        { nome: 'SAFRA', dados: resumo.SAFRA },
        { nome: 'PAGBANK', dados: resumo.PAGBANK },
        { nome: 'CIELO', dados: resumo.CIELO }
    ];

    // --- CORREÇÃO DO ERRO DE BUILD AQUI ---
    // Mapeamos o corpo da tabela e forçamos o tipo RowInput para o TS não reclamar
    const bodyBancos: RowInput[] = bancos.map(b => [
        b.nome,
        fmt(b.dados.PIX || 0),
        fmt(b.dados.Débito || 0),
        fmt(b.dados.Crédito || 0),
        fmt(b.dados.Voucher || 0),
        fmt(b.dados.caixinha || 0),
        {
            content: fmt(b.dados.total || 0),
            styles: { fontStyle: 'bold' as const } // O "as const" resolve o erro da Vercel
        }
    ]);

    autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 10,
        head: [['Operadora', 'PIX', 'Débito', 'Crédito', 'Voucher', 'Gorgetas', 'TOTAL']],
        body: bodyBancos,
        headStyles: { fillColor: [51, 65, 85] },
        styles: { fontSize: 8.5 }
    });

    // Seções de Caixinhas e Sangrias (mantidas)
    const caixinhas = lote.lancamentos.filter((l: any) => l.isCaixinha && l.valorCaixinha > 0);
    if (caixinhas.length > 0) {
        doc.text('DETALHAMENTO DE GORJETAS', 14, (doc as any).lastAutoTable.finalY + 10);
        autoTable(doc, {
            startY: (doc as any).lastAutoTable.finalY + 14,
            head: [['Mesa', 'Forma', 'Destinatário', 'Valor']],
            body: caixinhas.map((c: any) => [c.mesa || '--', c.formaPagamento, c.paraQuem || 'Não informado', fmt(c.valorCaixinha)]),
            headStyles: { fillColor: [219, 39, 119] }
        });
    }

    const sangrias = lote.lancamentos.filter((l: any) => l.isSaida);
    if (sangrias.length > 0) {
        doc.text('SANGRIAS E SAÍDAS', 14, (doc as any).lastAutoTable.finalY + 10);
        autoTable(doc, {
            startY: (doc as any).lastAutoTable.finalY + 14,
            head: [['Descrição / Identificação', 'Valor']],
            body: sangrias.map((s: any) => [s.identificacao || 'Sangria', fmt(s.valor)]),
            headStyles: { fillColor: [185, 28, 28] }
        });
    }

    doc.save(`FECHAMENTO_MARUJO_${lote.periodo}_${dataFormatada}.pdf`);
};