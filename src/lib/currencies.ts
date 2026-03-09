export const CURRENCIES = [
  { code: "EUR", symbol: "\u20ac", label: "Euro" },
  { code: "USD", symbol: "$", label: "Dollar am\u00e9ricain" },
  { code: "GBP", symbol: "\u00a3", label: "Livre sterling" },
  { code: "CHF", symbol: "CHF", label: "Franc suisse" },
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number]["code"];

export function formatAmount(amount: number, currency: CurrencyCode = "EUR"): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
  }).format(amount);
}
