import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { createPaymentCheckout, verifyPayment } from '../src/lib/payments-api.ts';

const originalFetch = globalThis.fetch;
const input = { service_id: '69c94b6589409b4f9e5bba37', name: ' Patient ', email: ' patient@example.com ' };
afterEach(() => { globalThis.fetch = originalFetch; });

test('sends only the selected ID and trimmed patient details with same-origin cookies', async () => {
  globalThis.fetch = async (url, options) => {
    assert.equal(url, '/api/payments/create');
    assert.equal(options.method, 'POST');
    assert.equal(options.credentials, 'same-origin');
    assert.equal(options.headers['Content-Type'], 'application/json');
    assert.ok(options.signal instanceof AbortSignal);
    assert.deepEqual(JSON.parse(options.body), { service_id: input.service_id, name: 'Patient', email: 'patient@example.com' });
    return Response.json({ authorization_url: 'https://sandbox.crosspoint.finance/checkout/cxp_test' }, { status: 201 });
  };
  assert.equal(await createPaymentCheckout({ ...input, amount: 1, organization_slug: 'wrong' }), 'https://sandbox.crosspoint.finance/checkout/cxp_test');
});

test('verification sends only the reference and accepts only validated payment results', async () => {
  const result = {
    status: 'pending', reference: 'REF-1', service: { id: input.service_id, name: 'CKMB' },
    authorization_url: 'https://sandbox.crosspoint.finance/checkout/cxp_test',
  };
  globalThis.fetch = async (url, options) => {
    assert.equal(url, '/api/payments/verify');
    assert.deepEqual(JSON.parse(options.body), { reference: 'REF-1' });
    assert.equal(options.credentials, 'same-origin');
    assert.equal(options.cache, 'no-store');
    return Response.json(result);
  };
  assert.deepEqual(await verifyPayment('REF-1'), result);
  for (const change of [{ reference: 'other' }, { status: 'success' }, { status: 'unknown' },
    { authorization_url: 'https://evil.example/checkout/test' }]) {
    globalThis.fetch = async () => Response.json({ ...result, ...change });
    await assert.rejects(verifyPayment('REF-1'), /Contact the lab/);
  }
});

test('verification reports API failures and preserves cancellation', async () => {
  globalThis.fetch = async () => Response.json({ error: 'Your payment session is missing or expired.' }, { status: 403 });
  await assert.rejects(verifyPayment('REF-1'), /missing or expired/);
  globalThis.fetch = async () => new Response('not json', { status: 502 });
  await assert.rejects(verifyPayment('REF-1'), /do not pay again/);
  const controller = new AbortController();
  controller.abort();
  globalThis.fetch = async (_url, options) => { assert.equal(options.signal.aborted, true); throw new Error('aborted'); };
  await assert.rejects(verifyPayment('REF-1', controller.signal), /do not pay again/);
});

test('provides recoverable errors for API, network and malformed responses', async () => {
  globalThis.fetch = async () => Response.json({ error: 'Sandbox payments are not configured yet.' }, { status: 503 });
  await assert.rejects(createPaymentCheckout(input), /not configured/);
  globalThis.fetch = async () => { throw new TypeError('Failed to fetch'); };
  await assert.rejects(createPaymentCheckout(input), /Check your connection/);
  globalThis.fetch = async () => new Response('<html>Not found</html>');
  await assert.rejects(createPaymentCheckout(input), /Check your connection/);
  globalThis.fetch = async () => Response.json({ error: {} }, { status: 500 });
  await assert.rejects(createPaymentCheckout(input), /Please try again/);
});

test('rejects missing, malformed, credential-bearing and unexpected checkout destinations', async () => {
  for (const url of [undefined, '', 'not a url', 'javascript:alert(1)', '/checkout/test',
    'https://evil.example/checkout/test', 'http://sandbox.crosspoint.finance/checkout/test',
    'https://sandbox.crosspoint.finance@evil.example/checkout/test',
    'https://user:password@sandbox.crosspoint.finance/checkout/test',
    'https://sandbox.crosspoint.finance/portal']) {
    globalThis.fetch = async () => Response.json({ authorization_url: url });
    await assert.rejects(createPaymentCheckout(input), /Please try again/);
  }
  globalThis.fetch = async () => Response.json(null);
  await assert.rejects(createPaymentCheckout(input), /Please try again/);
});
