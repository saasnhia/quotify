import Stripe from 'stripe';

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error('STRIPE_SECRET_KEY is not set');
    }
    _stripe = new Stripe(key, { apiVersion: '2026-02-25.clover' });
  }
  return _stripe;
}

export const PLANS = {
  free: { name: 'Gratuit', devisLimit: 3, price: 0, teamLimit: 1 },
  pro: { name: 'Pro', devisLimit: -1, price: 19, teamLimit: 1 },
  business: { name: 'Business', devisLimit: -1, price: 39, teamLimit: 5 },
} as const;

export type PlanId = keyof typeof PLANS;

export function getPlanLimit(plan: PlanId): number {
  return PLANS[plan].devisLimit;
}

export function canCreateDevis(plan: PlanId, devisUsed: number): boolean {
  const limit = PLANS[plan].devisLimit;
  if (limit === -1) return true;
  return devisUsed < limit;
}
