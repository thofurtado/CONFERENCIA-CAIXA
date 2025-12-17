export interface Lancamento {
    id: number;
    mesa?: string;
    banco: string;
    formaPagamento: string;
    valor: number;
    isCaixinha: boolean;
    isSaida?: boolean; 
    data: string;
}

export interface LoteConferencia {
    id: string;
    dataReferencia: string; // Ex: 2023-10-25
    periodo: string; // Ex: Almoço, Jantar, Turno 1
    lancamentos: Lancamento[];
}

export const BANCOS_DIGITAIS = ['SAFRA', 'PAGBANK', 'CIELO'];
export const FORMAS_BANCO = ['Pix', 'Voucher', 'Débito', 'Crédito'];
export const FORMAS_CASA = ['Funcionário', 'Pro-labore', 'Cortesia', 'Permuta'];