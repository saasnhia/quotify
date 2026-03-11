export type QuoteStatus = 'prospect' | 'brouillon' | 'envoyé' | 'signé' | 'accepté' | 'refusé' | 'payé';

export interface Prospect {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  company: string | null;
  notes: string | null;
  estimated_amount: number;
  created_at: string;
  converted_quote_id: string | null;
}

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
  portal_token: string | null;
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
  is_recurring: boolean;
  recurring_frequency: RecurringFrequency | null;
  recurring_start_date: string | null;
  recurring_end_date: string | null;
  recurring_next_date: string | null;
  recurring_invoice_count: number;
  currency: string;
  view_count: number;
  deposit_percent: number | null;
  deposit_paid_at: string | null;
  version: number;
  parent_quote_id: string | null;
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

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue';
export type RecurringFrequency = 'monthly' | 'quarterly' | 'yearly';

export interface Invoice {
  id: string;
  user_id: string;
  quote_id: string | null;
  client_id: string | null;
  invoice_number: string;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  due_date: string | null;
  paid_at: string | null;
  stripe_checkout_url: string | null;
  stripe_payment_intent_id: string | null;
  pdf_url: string | null;
  created_at: string;
}

export interface InvoiceWithClient extends Invoice {
  clients: Client | null;
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

// ── Quote Templates ──────────────────────────────────────────

export interface QuoteTemplateItem {
  description: string;
  quantity: number;
  unit_price: number;
  unit?: string;
}

export interface QuoteTemplate {
  id: string;
  user_id: string | null;
  name: string;
  description: string | null;
  category: string;
  is_default: boolean;
  is_system: boolean;
  items: QuoteTemplateItem[];
  default_validity_days: number;
  default_payment_terms: string | null;
  default_notes: string | null;
  times_used: number;
  created_at: string;
  updated_at: string;
}

// ── Lead Forms ───────────────────────────────────────────────

export interface LeadFormFields {
  name: boolean;
  email: boolean;
  phone: boolean;
  company: boolean;
  project_type: boolean;
  budget_range: boolean;
  message: boolean;
  deadline: boolean;
}

export interface CustomField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'url' | 'select' | 'date';
  options?: string[];
  required?: boolean;
}

export interface LeadForm {
  id: string;
  user_id: string | null;
  name: string;
  slug: string;
  is_active: boolean;
  is_system: boolean;
  fields: LeadFormFields;
  custom_fields: CustomField[] | null;
  suggested_template_id: string | null;
  title: string;
  subtitle: string;
  button_text: string;
  accent_color: string;
  auto_pipeline_stage: string;
  notification_email: string | null;
  redirect_url: string | null;
  created_at: string;
}

// ── Leads ────────────────────────────────────────────────────

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';

export interface Lead {
  id: string;
  user_id: string | null;
  form_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  project_type: string | null;
  budget_range: string | null;
  message: string | null;
  deadline: string | null;
  responses: Record<string, string | number> | null;
  source: string;
  ip_address: string | null;
  user_agent: string | null;
  converted_to_client_id: string | null;
  converted_to_quote_id: string | null;
  pipeline_stage: string;
  status: LeadStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeadWithForm extends Lead {
  lead_forms: LeadForm | null;
}

// ── Contracts ─────────────────────────────────────────────────

export type ContractStatus = 'draft' | 'active' | 'paused' | 'ended';

export interface Contract {
  id: string;
  user_id: string;
  client_id: string | null;
  template_id: string | null;
  title: string;
  description: string | null;
  amount: number;
  currency: string;
  frequency: RecurringFrequency;
  start_date: string;
  end_date: string | null;
  next_invoice_date: string | null;
  status: ContractStatus;
  invoice_count: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContractWithClient extends Contract {
  clients: { name: string; email: string | null } | null;
}

export interface ContractTemplate {
  id: string;
  user_id: string | null;
  name: string;
  description: string | null;
  is_system: boolean;
  default_amount: number | null;
  default_frequency: string;
  default_duration_months: number | null;
  items: { description: string; quantity: number; unit_price: number }[];
  created_at: string;
}

// ── Team Members ──────────────────────────────────────────────

export type TeamRole = 'admin' | 'editor' | 'viewer';
export type InviteStatus = 'pending' | 'accepted' | 'rejected';

export interface TeamMember {
  id: string;
  owner_id: string;
  member_email: string;
  member_user_id: string | null;
  role: TeamRole;
  status: InviteStatus;
  invited_at: string;
  accepted_at: string | null;
}

// ── Notifications ─────────────────────────────────────────────

export type NotificationType = 'lead' | 'signature' | 'payment' | 'reminder' | 'system';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string | null;
  link: string | null;
  read: boolean;
  created_at: string;
}
