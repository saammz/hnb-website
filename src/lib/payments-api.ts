import { z } from 'zod';

const paymentResultSchema = z.object({
  status: z.enum(['success', 'pending', 'failed', 'abandoned']),
  reference: z.string().min(1),
  service: z.object({ id: z.string(), name: z.string() }),
  authorization_url: z.url().refine((value) => {
    const url = new URL(value);
    return url.origin === 'https://sandbox.crosspoint.finance' && !url.username && !url.password && url.pathname.startsWith('/checkout/');
  }),
  payment: z.object({
    amount: z.number().int().nonnegative(), currency: z.literal('ngn'),
    fees: z.number().int().nonnegative(), customer_paid_fee: z.boolean(), channel: z.string(),
    paid_at: z.iso.datetime({ offset: true }), order_id: z.uuid(),
    customer: z.object({ name: z.string().nullable(), email: z.email() }),
  }).optional(),
  handshake: z.discriminatedUnion('status', [
    z.object({ status: z.literal('pending') }),
    z.object({ status: z.literal('success'), booking_reference: z.string().min(1), simulated: z.literal(true) }),
  ]).optional(),
}).refine((value) => value.status !== 'success' || (!!value.payment && !!value.handshake));

export type PaymentResult = z.infer<typeof paymentResultSchema>;

export async function verifyPayment(reference: string, signal?: AbortSignal): Promise<PaymentResult> {
  let response: Response;
  let data;
  try {
    response = await fetch('/api/payments/verify', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin',
      cache: 'no-store',
      signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(15000)]) : AbortSignal.timeout(15000),
      body: JSON.stringify({ reference }),
    });
    data = await response.json();
  } catch {
    throw new Error('We couldn’t verify payment yet. Check your connection and try again; do not pay again.');
  }
  if (!response.ok) {
    throw new Error(typeof data?.error === 'string' && data.error.length > 0 && data.error.length <= 500
      ? data.error : 'Payment verification is unavailable. Please check again; do not pay again.');
  }
  const parsed = paymentResultSchema.safeParse(data);
  if (!parsed.success || parsed.data.reference !== reference) {
    throw new Error('We couldn’t confirm the returned payment details. Contact the lab with your reference.');
  }
  return parsed.data;
}

export async function createPaymentCheckout(input: { service_id: string; name: string; email: string }): Promise<string> {
  let response: Response;
  let data: { authorization_url?: unknown; error?: unknown };
  try {
    response = await fetch('/api/payments/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      signal: AbortSignal.timeout(35000),
      body: JSON.stringify({ service_id: input.service_id, name: input.name.trim(), email: input.email.trim() }),
    });
    data = await response.json();
  } catch {
    throw new Error('We couldn’t open checkout. Check your connection and try again.');
  }
  if (!response.ok) {
    throw new Error(typeof data?.error === 'string' && data.error.length > 0 && data.error.length <= 300
      ? data.error : 'We couldn’t create your checkout. Please try again.');
  }
  try {
    if (typeof data?.authorization_url !== 'string') throw new Error('Missing URL');
    const url = new URL(data.authorization_url);
    if (url.origin !== 'https://sandbox.crosspoint.finance' || url.username || url.password ||
        !url.pathname.startsWith('/checkout/')) throw new Error('Invalid URL');
    return url.href;
  } catch {
    throw new Error('We couldn’t open checkout. Please try again.');
  }
}
