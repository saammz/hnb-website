import { z } from 'zod';
import { json, paymentConfig, readPaymentContext, SANDBOX_API } from '../../server/payment-session.js';
import { mockEmrHandshake } from '../../server/emr-handshake.js';

const inputSchema = z.object({ reference: z.string().min(1).max(100).regex(/^[A-Za-z0-9.=_-]+$/) }).strict();
const verificationSchema = z.object({
  reference: z.string(),
  status: z.enum(['success', 'pending', 'failed', 'abandoned']),
  checkout_id: z.uuid(),
  amount: z.number().int().nonnegative(),
  currency: z.string(),
  metadata: z.object({ reference: z.string(), service_id: z.string(), organization_slug: z.string() }).passthrough(),
  fees: z.number().int().nonnegative().nullable(),
  customer_paid_fee: z.boolean().nullable(),
  channel: z.string().nullable(),
  paid_at: z.iso.datetime({ offset: true }).nullable(),
  order_id: z.uuid().nullable(),
  customer: z.object({ email: z.email(), name: z.string().nullable() }).passthrough(),
}).passthrough();

export async function verifyPayment(request, handoff = mockEmrHandshake) {
  if (request.method !== 'POST') return json(405, { error: 'Use POST to verify a payment.' }, { Allow: 'POST' });
  let config;
  try { config = paymentConfig(); }
  catch { return json(503, { error: 'Sandbox payments are not configured yet.' }); }
  if (request.headers.get('origin') !== config.appOrigin) return json(403, { error: 'Verify payment from this website.' });
  if (request.headers.get('content-type')?.split(';')[0].trim() !== 'application/json') return json(415, { error: 'Send a JSON request.' });
  let input;
  try {
    const body = await request.text();
    if (Buffer.byteLength(body) > 1024) return json(413, { error: 'Request is too large.' });
    input = inputSchema.parse(JSON.parse(body));
  } catch { return json(400, { error: 'Provide a valid payment reference.' }); }

  let context;
  try { context = readPaymentContext(request, config.secret); }
  catch {
    return json(403, { code: 'context_unavailable', error: 'Your payment session is missing or expired. Contact the lab with your reference so they can check it. Do not pay again without checking.' });
  }
  if (context.reference !== input.reference || context.organization.slug !== (process.env.ORG_SLUG || 'darlez')) {
    return json(409, { error: 'This reference does not match your payment session. Contact the lab before paying again.' });
  }

  let verification;
  try {
    const response = await fetch(`${SANDBOX_API}/v1/naira/checkouts/verify/${encodeURIComponent(input.reference)}`, {
      headers: { Authorization: `Bearer ${config.token}` }, cache: 'no-store', signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error('Verification unavailable');
    verification = verificationSchema.parse(await response.json());
    if (verification.status === 'success' && (!verification.order_id || !verification.paid_at ||
        verification.fees === null || verification.customer_paid_fee === null || !verification.channel)) {
      throw new Error('Incomplete paid transaction');
    }
  } catch { return json(502, { error: 'We couldn’t verify your payment yet. Please check again; do not start another payment.' }); }

  if (verification.reference !== context.reference || verification.checkout_id !== context.checkout_id ||
      verification.amount !== context.amount || verification.currency !== context.currency ||
      verification.metadata.reference !== context.reference || verification.metadata.service_id !== context.service.id ||
      verification.metadata.organization_slug !== context.organization.slug) {
    return json(409, { error: 'The payment details do not match this booking. Contact the lab with your reference before paying again.' });
  }

  const result = {
    status: verification.status, reference: context.reference,
    service: { id: context.service.id, name: context.service.name },
    authorization_url: context.authorization_url,
  };
  if (verification.status !== 'success') return json(200, result);

  const payment = {
    amount: verification.amount, currency: verification.currency, fees: verification.fees,
    customer_paid_fee: verification.customer_paid_fee, channel: verification.channel,
    paid_at: verification.paid_at, order_id: verification.order_id,
    customer: { name: verification.customer.name, email: verification.customer.email },
  };
  let handshake;
  try {
    const response = await handoff({
      organization: context.organization, service: context.service,
      expected_amount: context.amount, currency: context.currency,
      customer: verification.customer, verification,
    });
    handshake = z.object({ status: z.literal('success'), booking_reference: z.string().min(1), simulated: z.literal(true) }).parse(response);
  } catch {
    return json(200, { ...result, payment, handshake: { status: 'pending' } });
  }
  return json(200, { ...result, payment, handshake });
}

export default { fetch: (request) => verifyPayment(request) };
