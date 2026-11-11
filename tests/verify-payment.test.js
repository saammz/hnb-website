import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { afterEach, beforeEach, test } from 'node:test';
import { verifyPayment } from '../api/payments/verify.js';
import createHandler from '../api/payments/create.js';
import { paymentCookie } from '../server/payment-session.js';

const origin = 'https://hnb-website-woad.vercel.app';
const secret = 's'.repeat(64);
const context = {
  reference: randomUUID(), checkout_id: randomUUID(), amount: 1700000, currency: 'ngn',
  authorization_url: 'https://sandbox.crosspoint.finance/checkout/cxp_test',
  organization: { id: 'org-id', slug: 'darlez' },
  service: { id: '69c94b6589409b4f9e5bba37', name: 'CKMB', category: 'Laboratory', department: 'Cardiac' },
  expires_at: Date.now() + 86400000,
};
const paid = {
  reference: context.reference, checkout_id: context.checkout_id,
  status: 'success', amount: 1700000, currency: 'ngn',
  fees: 49000, customer_paid_fee: true, channel: 'card', failure_reason: null,
  paid_at: '2026-11-11T08:40:45.596556Z', created_at: '2026-11-11T08:24:28.794163Z',
  order_id: randomUUID(),
  metadata: { reference: context.reference, service_id: context.service.id, organization_slug: 'darlez', extra: 'preserved' },
  customer: { email: 'patient@example.com', name: 'Test Patient' },
  extra_provider_detail: 'preserve for the EMR only',
};
const originalFetch = globalThis.fetch;
let originalEnv;
let fetches;
const cookie = (value = context) => paymentCookie(value, secret, origin).split(';')[0];
function request({ body = { reference: context.reference }, session = cookie(), headers = {}, method = 'POST' } = {}) {
  return new Request(`${origin}/api/payments/verify`, { method,
    headers: { origin, 'Content-Type': 'application/json', cookie: session, ...headers },
    ...(method === 'POST' ? { body: typeof body === 'string' ? body : JSON.stringify(body) } : {}),
  });
}
function upstream(value = paid, status = 200) {
  globalThis.fetch = async (url, options) => {
    fetches.push({ url: String(url), options });
    return Response.json(value, { status });
  };
}
beforeEach(() => {
  originalEnv = { ...process.env };
  Object.assign(process.env, { APP_ORIGIN: origin, CROSSPOINT_ACCESS_TOKEN: 'test-token', PAYMENT_SESSION_SECRET: secret, ORG_SLUG: 'darlez' });
  fetches = [];
  upstream();
});
afterEach(() => { process.env = originalEnv; globalThis.fetch = originalFetch; });

test('verifies via sandbox and confirms only the simulated booking', async () => {
  const response = await verifyPayment(request());
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  const result = await response.json();
  assert.equal(result.status, 'success');
  assert.deepEqual(result.handshake, { status: 'success', booking_reference: `MOCK-${context.reference}`, simulated: true });
  assert.equal(result.payment.amount, 1700000);
  assert.equal(result.payment.fees, 49000);
  assert.equal(result.payment.customer_paid_fee, true);
  assert.equal(result.extra_provider_detail, undefined);
  assert.equal(result.metadata, undefined);
  assert.equal(fetches[0].url, `https://sandbox-api.crosspoint.finance/v1/naira/checkouts/verify/${context.reference}`);
  assert.equal(fetches[0].options.headers.Authorization, 'Bearer test-token');
});

test('hands the complete verified response and trusted service details to the server-only handoff', async () => {
  let payload;
  await verifyPayment(request(), async (value) => {
    payload = value;
    return { status: 'success', booking_reference: 'MOCK-booking', simulated: true };
  });
  assert.deepEqual(payload.verification, paid);
  assert.deepEqual(payload.service, context.service);
  assert.deepEqual(payload.organization, context.organization);
  assert.deepEqual(payload.customer, paid.customer);
  assert.equal(payload.expected_amount, 1700000);
});

test('requires a valid signed, unexpired session before any provider call', async () => {
  for (const session of ['', 'hnb_payment_context=garbage',
    cookie({ ...context, expires_at: Date.now() - 1 }), `${cookie()}; ${cookie()}`]) {
    const response = await verifyPayment(request({ session }));
    assert.equal(response.status, 403);
    assert.equal((await response.json()).code, 'context_unavailable');
  }
  const [name, signed] = cookie().split('=');
  const [encoded, signature] = signed.split('.');
  const forged = Buffer.from(JSON.stringify({ ...context, amount: 1 })).toString('base64url');
  assert.equal((await verifyPayment(request({ session: `${name}=${forged}.${signature}` }))).status, 403);
  assert.equal((await verifyPayment(request({ session: `${name}=${encoded}.${'A'.repeat(43)}` }))).status, 403);
  assert.equal(fetches.length, 0);
});

test('rejects wrong references, wrong configured organization and browser-supplied payment data', async () => {
  assert.equal((await verifyPayment(request({ body: { reference: 'other' } }))).status, 409);
  assert.equal((await verifyPayment(request({ body: { reference: context.reference, status: 'success' } }))).status, 400);
  assert.equal((await verifyPayment(request({ body: { reference: '../other' } }))).status, 400);
  assert.equal((await verifyPayment(request({ body: '{' }))).status, 400);
  process.env.ORG_SLUG = 'another-store';
  assert.equal((await verifyPayment(request())).status, 409);
  assert.equal(fetches.length, 0);
});

test('enforces method, origin, content type, body limit and configuration', async () => {
  assert.equal((await verifyPayment(request({ method: 'GET' }))).status, 405);
  assert.equal((await verifyPayment(request({ headers: { origin: 'https://evil.example' } }))).status, 403);
  assert.equal((await verifyPayment(request({ headers: { 'Content-Type': 'text/plain' } }))).status, 415);
  assert.equal((await verifyPayment(request({ body: ' '.repeat(1025) }))).status, 413);
  delete process.env.PAYMENT_SESSION_SECRET;
  assert.equal((await verifyPayment(request())).status, 503);
  assert.equal(fetches.length, 0);
});

test('does not hand off a mismatched reference, checkout, amount, currency or metadata', async () => {
  for (const change of [
    { reference: 'wrong' }, { checkout_id: randomUUID() }, { amount: 1 }, { currency: 'usd' },
    { metadata: { ...paid.metadata, service_id: 'wrong' } },
    { metadata: { ...paid.metadata, organization_slug: 'wrong' } },
    { metadata: { ...paid.metadata, reference: 'wrong' } },
  ]) {
    upstream({ ...paid, ...change });
    let called = false;
    const response = await verifyPayment(request(), async () => { called = true; });
    assert.equal(response.status, 409);
    assert.equal(called, false);
  }
});

test('returns pending, failed and abandoned states without attempting handoff', async () => {
  for (const status of ['pending', 'failed', 'abandoned']) {
    upstream({ ...paid, status, order_id: null, paid_at: null, fees: null, customer_paid_fee: null, channel: null });
    let called = false;
    const response = await verifyPayment(request(), async () => { called = true; });
    const result = await response.json();
    assert.equal(result.status, status);
    assert.equal(result.payment, undefined);
    assert.equal(result.handshake, undefined);
    assert.equal(result.authorization_url, context.authorization_url);
    assert.equal(called, false);
  }
});

test('rejects incomplete success, unknown statuses, malformed responses and provider failures', async () => {
  for (const change of [{ order_id: null }, { paid_at: null }, { status: 'unknown' }, { fees: -1 },
    { fees: null }, { channel: null }, { customer_paid_fee: null }, { paid_at: 'invalid' }]) {
    upstream({ ...paid, ...change });
    let called = false;
    assert.equal((await verifyPayment(request(), async () => { called = true; })).status, 502);
    assert.equal(called, false);
  }
  upstream({}, 500);
  assert.equal((await verifyPayment(request())).status, 502);
  globalThis.fetch = async () => { throw new Error('timeout'); };
  assert.equal((await verifyPayment(request())).status, 502);
});

test('preserves paid status if the handoff fails, and reverifies before retry', async () => {
  const failed = await verifyPayment(request(), async () => { throw new Error('EMR unavailable'); });
  const result = await failed.json();
  assert.equal(result.status, 'success');
  assert.equal(result.payment.order_id, paid.order_id);
  assert.deepEqual(result.handshake, { status: 'pending' });
  const retried = await verifyPayment(request());
  assert.equal((await retried.json()).handshake.status, 'success');
  assert.equal(fetches.length, 2);
  const invalid = await verifyPayment(request(), async () => ({ status: 'success', booking_reference: 'real', simulated: false }));
  assert.equal((await invalid.json()).handshake.status, 'pending');
});

test('uses the signed original amount even if catalogue prices later change', async () => {
  upstream(paid);
  const response = await verifyPayment(request());
  assert.equal(response.status, 200);
  assert.equal(fetches.length, 1);
  assert.ok(!fetches[0].url.includes('public-services'));
});

test('checkout creation and verification work together using the returned cookie', async () => {
  let initialized;
  process.env.SERVICES_API_URL = 'https://catalogue.example/public-services';
  globalThis.fetch = async (url, options) => {
    if (String(url).includes('catalogue.example')) return Response.json({ organization: context.organization, page: 1, total_pages: 1, services: [{ ...context.service, walkin_price: 17000 }] });
    if (options.method === 'POST') {
      initialized = JSON.parse(options.body);
      return Response.json({ reference: initialized.reference, checkout_id: context.checkout_id, authorization_url: context.authorization_url }, { status: 201 });
    }
    return Response.json({ ...paid, reference: initialized.reference, metadata: { ...initialized.metadata, reference: initialized.reference } });
  };
  const created = await createHandler.fetch(new Request(`${origin}/api/payments/create`, {
    method: 'POST', headers: { origin, 'Content-Type': 'application/json' },
    body: JSON.stringify({ service_id: context.service.id, name: 'Test Patient', email: 'patient@example.com' }),
  }));
  assert.equal(created.status, 201);
  const result = await verifyPayment(request({ session: created.headers.get('Set-Cookie').split(';')[0], body: { reference: initialized.reference } }));
  assert.equal((await result.json()).handshake.booking_reference, `MOCK-${initialized.reference}`);
});
