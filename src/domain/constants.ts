import type { CategoriesByType } from './types';

export const PIX_KEY = '460.038.778-39';
export const SUBSCRIPTION_AMOUNT = 25;

export const DEFAULT_CATEGORIES: CategoriesByType = {
  expense: [
    'Cartao de Credito',
    'Fixa',
    'Variavel',
    'Temporaria',
    'Saude',
    'Streaming',
    'Estudos',
    'Viagem',
    'Outros',
  ],
  income: ['Salario', 'Ganho Extra', 'Outros'],
  investment: [
    'Banco Inter',
    'Nubank',
    'C6',
    'Tesouro Direto',
    'CDB',
    'Acoes',
    'Fundos',
    'Cripto',
    'Outros',
  ],
};

export const ENTRY_TYPES = ['expense', 'income', 'investment'] as const;
