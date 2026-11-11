import assert from 'node:assert/strict';
import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { afterEach, beforeEach, test } from 'node:test';
import handler from '../api/payments/create.js';

const origin = 'https://hnb-website-woad.vercel.app';
const service = {
  id: '69c94b6589409b4f9e5bba37', name: 'CKMB', department: 'Cardiac',
  category: 'Laboratory', walkin_price: 17000, price: 15000,
};
const organization = { id: '69c635f63917174c36e97be5', slug: 'darlez' };
const checkoutId = randomUUID();
const authorizationUrl = 'https://sandbox.crosspoint.finance/checkout/cxp_c_test';
const originalFetch = globalThis.fetch;
let originalEnv;
let calls;

function request(body = { service_id: service.id, name: ' Test Patient ', email: 'test@example.com' }, options = {}) {
  return new Request(`${origin}/api/payments/create`, {
    method: 'POST', headers: { origin, 'Content-Type': 'application/json' },
    body: JSON.stringify(body), ...options,
  });
}

function upstream({ services = [service], pages = 1, checkout = {}, status = 201 } = {}) {
  globalThis.fetch = async (url, options) => {
    calls.push({ url: String(url), options });
    if (String(url).startsWith('https://catalogue.example/')) {
      return Response.json({ organization, page: Number(new URL(url).searchParams.get('page')), total_pages: pages, services });
    }
    const body = JSON.parse(options.body);
    return Response.json({ authorization_url: authorizationUrl, reference: body.reference, checkout_id: checkoutId, ...checkout }, { status });
  };
}

beforeEach(() => {
  originalEnv = { ...process.env };
  Object.assign(process.env, {
    CROSSPOINT_ACCESS_TOKEN: 'test-server-token', PAYMENT_SESSION_SECRET: 'a'.repeat(64),
    APP_ORIGIN: origin, SERVICES_API_URL: 'https://catalogue.example/public-services', ORG_SLUG: 'darlez',
  });
  calls = [];
  upstream();
});

afterEach(() => {
  process.env = originalEnv;
  globalThis.fetch = originalFetch;
});

test('creates an exact-price sandbox checkout and signs the expected verification context', async () => {
  const response = await handler.fetch(request());
  assert.equal(response.status, 201);
  assert.deepEqual(await response.json(), { authorization_url: authorizationUrl });
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
  const payment = calls[1];
  assert.equal(payment.url, 'https://sandbox-api.crosspoint.finance/v1/naira/checkouts');
  assert.equal(payment.options.headers.Authorization, 'Bearer test-server-token');
  const payload = JSON.parse(payment.options.body);
  assert.equal(payload.amount, 1700000);
  assert.equal(payload.customer_name, 'Test Patient');
  assert.equal(payload.email, 'test@example.com');
  assert.equal(payload.callback_url, `${origin}/payment/result`);
  assert.deepEqual(payload.metadata, { service_id: service.id, organization_slug: 'darlez' });
  assert.equal(payload.products, undefined);
  assert.equal(payload.currency, undefined);
  const cookie = response.headers.get('Set-Cookie');
  assert.match(cookie, /HttpOnly; SameSite=Lax; Path=\/api\/payments; Max-Age=86400; Secure$/);
  const [encoded, signature] = cookie.split(';')[0].split('=')[1].split('.');
  const expected = createHmac('sha256', process.env.PAYMENT_SESSION_SECRET).update(encoded).digest();
  assert.ok(timingSafeEqual(Buffer.from(signature, 'base64url'), expected));
  const context = JSON.parse(Buffer.from(encoded, 'base64url'));
  assert.equal(context.reference, payload.reference);
  assert.equal(context.checkout_id, checkoutId);
  assert.equal(context.amount, payload.amount);
  assert.equal(context.service.id, service.id);
  assert.deepEqual(context.organization, organization);
  assert.ok(context.expires_at > Date.now());
  assert.ok(context.expires_at <= Date.now() + 86400000);
  assert.ok(!cookie.includes('test-server-token'));
});

test('checks later catalogue pages rather than accepting the first service', async () => {
  const fetchPage = globalThis.fetch;
  globalThis.fetch = async (url, options) => {
    if (String(url).includes('page=1')) {
      calls.push({ url: String(url), options });
      return Response.json({ organization, page: 1, total_pages: 2, services: [{ ...service, id: 'another-test' }] });
    }
    return fetchPage(url, options);
  };
  assert.equal((await handler.fetch(request())).status, 201);
  assert.equal(calls.length, 3);
  assert.ok(calls[1].url.includes('page=2'));
});

test('rejects invalid input and browser-controlled price/organization without upstream calls', async () => {
  for (const body of [
    {}, { service_id: service.id, name: '', email: 'test@example.com' },
    { service_id: service.id, name: 'Patient', email: 'invalid' },
    { service_id: service.id, name: 'Patient', email: 'test@example.com', amount: 1 },
    { service_id: service.id, name: 'Patient', email: 'test@example.com', organization_slug: 'another-store' },
  ]) assert.equal((await handler.fetch(request(body))).status, 400);
  assert.equal((await handler.fetch(request(undefined, { body: '{' }))).status, 400);
  assert.equal(calls.length, 0);
});

test('requires same-origin JSON POST and configured server secrets', async () => {
  assert.equal((await handler.fetch(new Request(`${origin}/api/payments/create`))).status, 405);
  assert.equal((await handler.fetch(request(undefined, { headers: { origin: 'https://evil.example', 'Content-Type': 'application/json' } }))).status, 403);
  assert.equal((await handler.fetch(request(undefined, { headers: { 'Content-Type': 'application/json' } }))).status, 403);
  assert.equal((await handler.fetch(request(undefined, { headers: { origin, 'Content-Type': 'text/plain' } }))).status, 415);
  assert.equal((await handler.fetch(request(undefined, { body: ' '.repeat(8193) }))).status, 413);
  delete process.env.CROSSPOINT_ACCESS_TOKEN;
  assert.equal((await handler.fetch(request())).status, 503);
  process.env.CROSSPOINT_ACCESS_TOKEN = 'test-server-token';
  process.env.APP_ORIGIN = 'https://example.com/untrusted-path';
  assert.equal((await handler.fetch(request())).status, 503);
  assert.equal(calls.length, 0);
});

test('never falls back to price for missing, malformed, fractional-kobo or out-of-limit walk-in prices', async () => {
  for (const price of [undefined, null, '17000', {}, -1, 0, 199.99, 2000000.01, 17000.001]) {
    calls = [];
    upstream({ services: [{ ...service, walkin_price: price }] });
    const response = await handler.fetch(request());
    assert.equal(response.status, 422, `Unexpected status for ${JSON.stringify(price)}`);
    assert.equal(calls.length, 1);
  }
});

test('accepts amounts at the documented boundaries and decimal naira', async () => {
  for (const price of [200, 17000.25, 2000000]) {
    calls = [];
    upstream({ services: [{ ...service, walkin_price: price }] });
    assert.equal((await handler.fetch(request())).status, 201);
    assert.equal(JSON.parse(calls[1].options.body).amount, Math.round(price * 100));
  }
});

test('handles missing services, catalogue failures and wrong organizations', async () => {
  upstream({ services: [] });
  assert.equal((await handler.fetch(request())).status, 404);
  globalThis.fetch = async () => Response.json({ error: 'private upstream detail' }, { status: 500 });
  assert.equal((await handler.fetch(request())).status, 502);
  globalThis.fetch = async () => Response.json({ organization: { ...organization, slug: 'wrong-store' }, page: 1, total_pages: 1, services: [service] });
  assert.equal((await handler.fetch(request())).status, 502);
  globalThis.fetch = async () => { throw new Error('timeout'); };
  assert.equal((await handler.fetch(request())).status, 502);
});

test('does not expose upstream errors or set a context cookie on failed creation', async () => {
  upstream({ status: 422, checkout: { private: 'sensitive upstream details' } });
  const response = await handler.fetch(request());
  assert.equal(response.status, 502);
  assert.equal(response.headers.get('Set-Cookie'), null);
  assert.ok(!(await response.text()).includes('sensitive'));
});

test('rejects mismatched references and unsafe redirect URLs from upstream', async () => {
  for (const checkout of [
    { reference: 'wrong-reference' },
    { authorization_url: 'https://evil.example/checkout/test' },
    { authorization_url: 'https://sandbox.crosspoint.finance@evil.example/checkout/test' },
    { checkout_id: 'invalid-id' },
  ]) {
    upstream({ checkout });
    const response = await handler.fetch(request());
    assert.equal(response.status, 502);
    assert.equal(response.headers.get('Set-Cookie'), null);
  }
});

test('uses non-Secure cookies only for explicitly configured local HTTP development', async () => {
  process.env.APP_ORIGIN = 'http://localhost:3000';
  const response = await handler.fetch(request(undefined, { headers: { origin: process.env.APP_ORIGIN, 'Content-Type': 'application/json' } }));
  assert.equal(response.status, 201);
  assert.ok(!response.headers.get('Set-Cookie').includes('; Secure'));
});
