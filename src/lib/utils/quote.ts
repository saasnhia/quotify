import type { QuoteItemDraft } from '@/types';

export function calculateItemTotal(quantity: number, unitPrice: number): number {
  return Math.round(quantity * unitPrice * 100) / 100;
}

export function calculateTotals(
  items: QuoteItemDraft[],
  tvaRate: number,
  discount: number
) {
  const subtotalHT = items.reduce(
    (sum, item) => sum + calculateItemTotal(item.quantity, item.unit_price),
    0
  );

  const discountAmount = Math.round(subtotalHT * (discount / 100) * 100) / 100;
  const totalHT = Math.round((subtotalHT - discountAmount) * 100) / 100;
  const tvaAmount = Math.round(totalHT * (tvaRate / 100) * 100) / 100;
  const totalTTC = Math.round((totalHT + tvaAmount) * 100) / 100;

  return { subtotalHT, discountAmount, totalHT, tvaAmount, totalTTC };
}

export function generateQuoteNumber(sequenceNumber: number): string {
  const year = new Date().getFullYear();
  const num = String(sequenceNumber).padStart(4, '0');
  return `DEV-${year}-${num}`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(dateString));
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'brouillon':
      return 'bg-gray-100 text-gray-700';
    case 'envoyé':
      return 'bg-blue-100 text-blue-700';
    case 'signé':
      return 'bg-green-100 text-green-700';
    case 'accepté':
      return 'bg-emerald-100 text-emerald-700';
    case 'refusé':
      return 'bg-red-100 text-red-700';
    case 'payé':
      return 'bg-violet-100 text-violet-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case 'brouillon':
      return 'Brouillon';
    case 'envoyé':
      return 'Envoyé';
    case 'signé':
      return 'Signé';
    case 'accepté':
      return 'Accepté';
    case 'refusé':
      return 'Refusé';
    case 'payé':
      return 'Payé';
    default:
      return status;
  }
}
