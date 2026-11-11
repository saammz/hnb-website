import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { json, paymentConfig, paymentCookie, SANDBOX_API } from '../../server/payment-session.js';

const inputSchema = z.object({
  service_id: z.string().regex(/^[a-f\d]{24}$/i),
  name: z.string().trim().min(1).max(200),
  email: z.email().max(254),
}).strict();

const serviceSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(500),
  department: z.string().max(200),
  category: z.string().max(200),
  walkin_price: z.unknown().optional(),
});

const pageSchema = z.object({
  organization: z.object({ id: z.string(), slug: z.string() }),
  page: z.number().int().positive(),
  total_pages: z.number().int().min(0).max(1000),
  services: z.array(serviceSchema),
});

const checkoutSchema = z.object({
  authorization_url: z.url(),
  reference: z.string(),
  checkout_id: z.uuid(),
});

async function createCheckout(request) {
  if (request.method !== 'POST') {
    return json(405, { error: 'Use POST to create a checkout.' }, { Allow: 'POST' });
  }

  let config;
  try {
    config = paymentConfig();
  } catch {
    return json(503, { error: 'Sandbox payments are not configured yet.' });
  }
  const { token, secret, appOrigin } = config;

  if (request.headers.get('origin') !== appOrigin) {
    return json(403, { error: 'Checkout must be started from this website.' });
  }
  if (request.headers.get('content-type')?.split(';')[0].trim() !== 'application/json') {
    return json(415, { error: 'Send a JSON request.' });
  }

  let input;
  try {
    const body = await request.text();
    if (Buffer.byteLength(body) > 8192) return json(413, { error: 'Request is too large.' });
    input = inputSchema.parse(JSON.parse(body));
  } catch {
    return json(400, { error: 'Provide a valid service ID, name and email only.' });
  }

  const slug = process.env.ORG_SLUG || 'darlez';
  const servicesUrl = process.env.SERVICES_API_URL || 'https://api-prod.lightbasemr.com/public-services';
  let service;
  let organization;
  try {
    const signal = AbortSignal.timeout(15000);
    // shortcut: scan pages until a service is found; use a direct lookup when the EMR API supports it.
    for (let page = 1; ; page += 1) {
      const url = new URL(servicesUrl);
      url.search = new URLSearchParams({ slug, page: String(page), limit: '100' }).toString();
      const response = await fetch(url, { signal, cache: 'no-store' });
      if (!response.ok) throw new Error('Catalogue unavailable');
      const data = pageSchema.parse(await response.json());
      if (data.page !== page || data.organization.slug !== slug) throw new Error('Invalid catalogue');
      service = data.services.find((item) => item.id === input.service_id);
      if (service) {
        organization = data.organization;
        break;
      }
      if (page >= data.total_pages) break;
    }
  } catch {
    return json(502, { error: 'Could not retrieve the test catalogue. Please try again.' });
  }
  if (!service) return json(404, { error: 'This test is not available.' });

  const price = service.walkin_price;
  if (typeof price !== 'number' || !Number.isFinite(price)) {
    return json(422, { error: 'This test does not have a supported walk-in price. Please contact the lab.' });
  }
  const amount = Math.round(price * 100);
  if (!Number.isSafeInteger(amount) || Math.abs(price * 100 - amount) > 0.000001 ||
      amount < 20000 || amount > 200000000) {
    return json(422, { error: 'This test does not have a supported walk-in price. Please contact the lab.' });
  }

  const reference = randomUUID();
  let checkout;
  try {
    const response = await fetch(`${SANDBOX_API}/v1/naira/checkouts`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(10000),
      body: JSON.stringify({
        email: input.email,
        customer_name: input.name,
        amount,
        reference,
        callback_url: `${appOrigin}/payment/result`,
        metadata: { service_id: service.id, organization_slug: slug },
      }),
    });
    if (!response.ok) {
      // Do not log upstream bodies: they can contain customer details or session tokens.
      console.error('Crosspoint sandbox checkout creation failed', { status: response.status, reference });
      return json(502, { error: 'Crosspoint could not create the checkout. Please try again.' });
    }
    checkout = checkoutSchema.parse(await response.json());
    const url = new URL(checkout.authorization_url);
    if (checkout.reference !== reference || url.origin !== 'https://sandbox.crosspoint.finance' ||
        url.username || url.password || !url.pathname.startsWith('/checkout/')) {
      throw new Error('Invalid checkout response');
    }
  } catch {
    return json(502, { error: 'Could not confirm checkout creation. No payment has been confirmed; please try again.' });
  }

  const context = {
    reference,
    checkout_id: checkout.checkout_id,
    authorization_url: checkout.authorization_url,
    amount,
    currency: 'ngn',
    organization,
    service: { id: service.id, name: service.name, department: service.department, category: service.category },
    expires_at: Date.now() + 24 * 60 * 60 * 1000,
  };
  try {
    return json(201, { authorization_url: checkout.authorization_url }, {
      'Set-Cookie': paymentCookie(context, secret, appOrigin),
    });
  } catch {
    return json(502, { error: 'Could not prepare your payment session. Please contact the lab.' });
  }
}

export default { fetch: createCheckout };
