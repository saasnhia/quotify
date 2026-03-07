export type QuoteStatus = 'brouillon' | 'envoyé' | 'signé' | 'accepté' | 'refusé' | 'payé';

export interface Client {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  siret: string | null;
  created_at: string;
}

export interface QuoteItem {
  id: string;
  quote_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
  position: number;
}

export interface Quote {
  id: string;
  user_id: string;
  client_id: string | null;
  number: number;
  title: string;
  total_ht: number;
  tva_rate: number;
  discount: number;
  total_ttc: number;
  status: QuoteStatus;
  notes: string | null;
  valid_until: string | null;
  pdf_url: string | null;
  ai_prompt: string | null;
  share_token: string | null;
  viewed_at: string | null;
  signature_data: string | null;
  signer_name: string | null;
  signed_at: string | null;
  stripe_checkout_session: string | null;
  stripe_payment_intent: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuoteWithClient extends Quote {
  clients: Client | null;
}

export interface QuoteWithItems extends Quote {
  quote_items: QuoteItem[];
  clients: Client | null;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  company_name: string | null;
  company_address: string | null;
  company_siret: string | null;
  company_phone: string | null;
  logo_url: string | null;
  default_tva_rate: number;
}

export interface StripeSubscription {
  id: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  plan: 'starter' | 'pro';
  current_period_end: string;
}

export interface QuoteItemDraft {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface AIGeneratedQuote {
  title: string;
  items: { description: string; quantity: number; unit_price: number }[];
  notes: string;
}
