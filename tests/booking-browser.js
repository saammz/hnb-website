import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

// Serve the built app through CDP interception: no dev server, real API calls or payments.
const root = path.resolve(import.meta.dirname, '..');
const profile = await mkdtemp(path.join(tmpdir(), 'hnb-booking-'));
const chrome = spawn(process.env.CHROME_BINARY || 'google-chrome', [
  '--headless', '--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu',
  '--no-first-run', '--remote-debugging-pipe', `--user-data-dir=${profile}`, 'about:blank',
], { stdio: ['ignore', 'ignore', 'pipe', 'pipe', 'pipe'] });
const pending = new Map();
let sequence = 0;
let session;
let buffer = '';
let mode = 'error';
let heldRequest;
const payments = [];
const queries = [];
let verificationStates = ['pending', 'success'];
let verificationCalls = 0;
const failures = [];
let browserErrors = '';
chrome.stderr.on('data', (chunk) => { browserErrors = (browserErrors + chunk).slice(-3000); });
chrome.on('error', (error) => {
  for (const item of pending.values()) item.reject(error);
});
for (const pipe of [chrome.stdio[3], chrome.stdio[4]]) {
  pipe.on('error', (error) => {
    for (const item of pending.values()) {
      clearTimeout(item.timer);
      item.reject(new Error(`${error.message}: ${browserErrors}`));
    }
  });
}

function send(method, params = {}, sessionId = session) {
  return new Promise((resolve, reject) => {
    const id = ++sequence;
    const timer = setTimeout(() => {
      pending.delete(id);
      reject(new Error(`CDP timed out: ${method}. ${browserErrors}`));
    }, 15000);
    pending.set(id, { resolve, reject, timer });
    chrome.stdio[3].write(`${JSON.stringify({ id, method, params, sessionId })}\0`);
  });
}

async function fulfil(requestId, body, contentType = 'application/json', responseCode = 200) {
  await send('Fetch.fulfillRequest', {
    requestId, responseCode,
    responseHeaders: [{ name: 'Content-Type', value: contentType }, { name: 'Access-Control-Allow-Origin', value: '*' }],
    body: Buffer.from(body).toString('base64'),
  });
}

const services = [
  { id: '69c94b6589409b4f9e5bba37', name: 'CKMB', department: 'Cardiac', category: 'Laboratory', walkin_price: 17000 },
  { id: '69c94b6589409b4f9e5bba3b', name: 'Troponin I', department: 'Cardiac', category: 'Laboratory', walkin_price: 16000 },
];

async function intercept({ requestId, request }) {
  const url = new URL(request.url);
  if (url.pathname === '/public-services') {
    queries.push(url.searchParams.toString());
    const page = Number(url.searchParams.get('page') || 1);
    const search = url.searchParams.get('search');
    const filtered = search ? services.filter((s) => s.name.toLowerCase().includes(search.toLowerCase())) : services;
    await fulfil(requestId, JSON.stringify({ organization: { id: 'org', slug: 'darlez' },
      count: filtered.length, page, limit: 48, total_pages: search ? 1 : 2, departments: ['Cardiac'],
      services: search ? filtered : [services[page === 1 ? 0 : 1]],
    }));
  } else if (url.pathname === '/api/payments/verify') {
    verificationCalls++;
    const state = verificationStates.length > 1 ? verificationStates.shift() : verificationStates[0];
    if (state === 'error') { await fulfil(requestId, JSON.stringify({ error: 'Your payment session is missing or expired. Do not pay again.' }), 'application/json', 403); return; }
    const reference = JSON.parse(request.postData).reference;
    const paid = state === 'success' || state === 'handoff-pending';
    await fulfil(requestId, JSON.stringify({
      reference, status: paid ? 'success' : state, service: { id: services[0].id, name: 'CKMB' },
      authorization_url: 'https://sandbox.crosspoint.finance/checkout/cxp_test',
      ...(paid ? {
        payment: { amount: 1700000, currency: 'ngn', fees: 49000, customer_paid_fee: true, channel: 'card', paid_at: '2026-11-11T08:40:45.596Z', order_id: 'beb9a23f-1fe3-42ee-b42e-2598742452fd', customer: { name: 'Test Patient', email: 'patient@example.com' } },
        handshake: state === 'handoff-pending' ? { status: 'pending' } : { status: 'success', booking_reference: `MOCK-${reference}`, simulated: true },
      } : {}),
    }));
  } else if (url.pathname === '/api/payments/create') {
    payments.push(JSON.parse(request.postData));
    if (mode === 'pending') { heldRequest = requestId; return; }
    if (mode === 'network') { await send('Fetch.failRequest', { requestId, errorReason: 'Failed' }); return; }
    if (mode === 'malformed') { await fulfil(requestId, '<html>Unexpected response</html>', 'text/html'); return; }
    if (mode === 'unsafe') { await fulfil(requestId, JSON.stringify({ authorization_url: 'https://evil.example/checkout/test' })); return; }
    if (mode === 'success') { await fulfil(requestId, JSON.stringify({ authorization_url: 'https://sandbox.crosspoint.finance/checkout/cxp_test' }), 'application/json', 201); return; }
    await fulfil(requestId, JSON.stringify({ error: 'Sandbox payments are not configured yet.' }), 'application/json', 503);
  } else if (url.origin === 'https://sandbox.crosspoint.finance') {
    await fulfil(requestId, '<html><body>Mock hosted checkout</body></html>', 'text/html');
  } else if (url.origin === 'http://hnb.test') {
    const file = ['/', '/payment/result'].includes(url.pathname) ? '/index.html' : url.pathname;
    const filePath = path.resolve(root, `dist${file}`);
    assert.ok(filePath.startsWith(path.join(root, 'dist') + path.sep));
    const type = file.endsWith('.js') ? 'text/javascript' : file.endsWith('.css') ? 'text/css' : file.endsWith('.svg') ? 'image/svg+xml' : file.endsWith('.png') ? 'image/png' : 'text/html';
    try { await fulfil(requestId, await readFile(filePath), type); }
    catch { await fulfil(requestId, '', 'text/plain', 404); }
  } else {
    await fulfil(requestId, '', 'text/plain');
  }
}

chrome.stdio[4].on('data', (chunk) => {
  buffer += chunk.toString();
  let end;
  while ((end = buffer.indexOf('\0')) >= 0) {
    const message = JSON.parse(buffer.slice(0, end));
    buffer = buffer.slice(end + 1);
    if (message.id) {
      const item = pending.get(message.id);
      if (item) { clearTimeout(item.timer); pending.delete(message.id); message.error ? item.reject(new Error(message.error.message)) : item.resolve(message.result); }
    } else if (message.method === 'Fetch.requestPaused') {
      intercept(message.params).catch((error) => failures.push(error));
    } else if (message.method === 'Runtime.exceptionThrown') {
      failures.push(new Error(message.params.exceptionDetails.text));
    }
  }
});

const evaluate = async (expression) => {
  const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
  return result.result.value;
};
const until = async (expression) => {
  for (let i = 0; i < 100; i++) {
    if (failures.length) throw failures[0];
    if (await evaluate(expression)) return;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Timed out: ${expression}`);
};
const click = (text) => evaluate(`[...document.querySelectorAll('button')].find(b => b.textContent.trim() === ${JSON.stringify(text)}).click()`);
const fill = (name, email) => evaluate(`document.querySelector('[name=name]').value = ${JSON.stringify(name)}; document.querySelector('[name=name]').dispatchEvent(new Event('input', { bubbles: true })); document.querySelector('[name=email]').value = ${JSON.stringify(email)};`);
const submit = () => evaluate(`document.querySelector('[role=dialog] form').requestSubmit()`);

try {
  await readFile(path.join(root, 'dist/index.html'));
  const { targetId } = await send('Target.createTarget', { url: 'about:blank' }, undefined);
  const attached = await send('Target.attachToTarget', { targetId, flatten: true }, undefined);
  session = attached.sessionId;
  await send('Runtime.enable');
  await send('Page.enable');
  await send('Fetch.enable', { patterns: [{ urlPattern: '*' }] });
  await send('Page.navigate', { url: 'http://hnb.test/' });
  await until("document.querySelector('#test-directory h3')?.textContent === 'CKMB'");
  assert.ok(!await evaluate("document.querySelector('#test-directory').innerText.includes('17,000')"));
  await evaluate("(() => { const input = document.querySelector('input[type=search]'); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, 'Troponin'); input.dispatchEvent(new Event('input', { bubbles: true })); })()");
  await until("document.querySelector('#test-directory h3')?.textContent === 'Troponin I'");
  await evaluate("(() => { const input = document.querySelector('input[type=search]'); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, ''); input.dispatchEvent(new Event('input', { bubbles: true })); })()");
  await until("document.querySelector('#test-directory h3')?.textContent === 'CKMB'");
  await click('Cardiac');
  await until("document.querySelector('#test-directory button[aria-label^=\"Book a Test\"]')");
  await click('Next');
  await until("document.querySelector('#test-directory h3')?.textContent === 'Troponin I'");
  await click('Book a Test');
  await until("document.querySelector('[role=dialog] [name=name]') === document.activeElement");
  for (let i = 0; i < 6; i++) {
    await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
    assert.ok(await evaluate("document.querySelector('[role=dialog]').contains(document.activeElement)"));
  }
  assert.ok(await evaluate("document.querySelector('[role=dialog]').innerText.includes('Troponin I')"));
  await submit();
  assert.equal(payments.length, 0);
  await fill('   ', 'patient@example.com');
  await submit();
  assert.equal(payments.length, 0);
  await fill('Patient', 'invalid');
  await submit();
  assert.equal(payments.length, 0);
  await fill(' Test Patient ', 'patient@example.com');
  await submit();
  await until("document.querySelector('[role=alert]')?.textContent.includes('not configured')");
  assert.deepEqual(payments.at(-1), { service_id: services[1].id, name: 'Test Patient', email: 'patient@example.com' });
  assert.equal(await evaluate("document.querySelector('[name=email]').value"), 'patient@example.com');

  mode = 'pending';
  await submit();
  await until("document.querySelector('button[type=submit]').disabled");
  for (let i = 0; i < 100 && !heldRequest; i++) await new Promise((resolve) => setTimeout(resolve, 50));
  assert.ok(heldRequest, 'Pending checkout request was intercepted');
  const attempts = payments.length;
  await evaluate("document.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))");
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape' });
  assert.equal(payments.length, attempts);
  assert.ok(await evaluate("!!document.querySelector('[role=dialog]')"));
  await fulfil(heldRequest, JSON.stringify({ error: 'Please try again.' }), 'application/json', 502);
  await until("!document.querySelector('button[type=submit]').disabled");

  for (mode of ['unsafe', 'malformed', 'network']) {
    await submit();
    await until("!document.querySelector('button[type=submit]').disabled && !!document.querySelector('[role=alert]')");
    assert.equal(await evaluate('location.origin'), 'http://hnb.test');
  }
  await evaluate("document.querySelector('[aria-label=\"Close booking form\"]').click()");
  await until("!document.querySelector('[role=dialog]')");
  await until("document.activeElement?.getAttribute('aria-label') === 'Book a Test: Troponin I'");
  await click('Book a Test');
  await until("!!document.querySelector('[name=name]')");
  assert.equal(await evaluate("document.querySelector('[name=name]').value"), '');
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  const bounds = await evaluate("(() => { const r = document.querySelector('[role=dialog]').getBoundingClientRect(); return { left: r.left, right: r.right, height: r.height }; })()");
  assert.ok(bounds.left >= 0 && bounds.right <= 390 && bounds.height <= 844, JSON.stringify(bounds));
  const screenshot = await send('Page.captureScreenshot', { format: 'png' });
  await writeFile(path.join(tmpdir(), 'hnb-booking-mobile.png'), Buffer.from(screenshot.data, 'base64'));
  await fill('Test Patient', 'patient@example.com');
  mode = 'success';
  await submit();
  await until("location.origin === 'https://sandbox.crosspoint.finance' && document.body.innerText.includes('Mock hosted checkout')");
  await send('Page.navigate', { url: 'http://hnb.test/payment/result?reference=REF-1' });
  await until("document.querySelector('h1')?.textContent.includes('confirming your payment')");
  await until("document.querySelector('h1')?.textContent.includes('EMR booking simulated')");
  assert.equal(verificationCalls, 2);
  assert.ok(await evaluate("document.body.innerText.includes('17,490.00') && document.body.innerText.includes('MOCK-REF-1') && document.body.innerText.includes('no hospital booking')"));
  for (const state of ['failed', 'abandoned', 'error', 'handoff-pending']) {
    verificationStates = [state];
    await send('Page.navigate', { url: 'http://hnb.test/payment/result?reference=REF-1' });
    if (state === 'failed' || state === 'abandoned') {
      await until("document.querySelector('a[href=\"https://sandbox.crosspoint.finance/checkout/cxp_test\"]')");
      assert.ok(!await evaluate("document.body.innerText.includes('EMR booking simulated')"));
    } else if (state === 'error') {
      await until("document.querySelector('[role=alert]')?.textContent.includes('missing or expired')");
      assert.ok(!await evaluate("document.querySelector('a[href*=sandbox]')"));
    } else {
      await until("document.querySelector('h1')?.textContent.includes('booking confirmation pending')");
      verificationStates = ['success'];
      await click('Retry booking confirmation');
      await until("document.querySelector('h1')?.textContent.includes('EMR booking simulated')");
    }
  }
  const beforeMissing = verificationCalls;
  await send('Page.navigate', { url: 'http://hnb.test/payment/result' });
  await until("document.querySelector('h1')?.textContent.includes('reference unavailable')");
  assert.equal(verificationCalls, beforeMissing);
  assert.ok(queries.some((query) => query.includes('department=Cardiac')));
  assert.ok(queries.some((query) => query.includes('search=Troponin')));
  assert.equal(failures.length, 0);
  console.log('PASS: directory booking, validation, error recovery, focus/mobile checks, hosted redirect, return-page polling, simulated handoff, pending handoff retry, failed/abandoned/session recovery.');
} finally {
  chrome.kill('SIGKILL');
  for (const item of pending.values()) clearTimeout(item.timer);
  if (chrome.exitCode === null && chrome.signalCode === null) {
    await new Promise((resolve) => chrome.once('close', resolve));
  }
  await rm(profile, { recursive: true, force: true });
}
