import { checkRateLimit } from '@vercel/firewall';
import { json } from './payment-session.js';

export async function checkoutRateLimit(request) {
  try {
    const development = process.env.NODE_ENV !== 'production';
    const host = process.env.CHECKOUT_FIREWALL_HOST;
    // The SDK otherwise allows every request in development without checking a rule.
    if (development && !host) throw new Error('Development firewall host is missing');
    if (host && new URL(`https://${host}`).host !== host) throw new Error('Invalid firewall host');
    const headers = new Headers(request.headers);
    headers.set('host', new URL(process.env.APP_ORIGIN).host);
    const result = await checkRateLimit('hnb-checkout-create', {
      headers,
      timeout: 1500,
      ...(development ? { firewallHostForDevelopment: host, rateLimitKey: 'hnb-local-development' } : {}),
    });
    if (result.rateLimited === true) {
      return json(429, { error: 'Too many checkout attempts. Please wait one minute and try again.' }, { 'Retry-After': '60' });
    }
    if (result.error || result.rateLimited !== false) throw new Error('Firewall rule unavailable');
    return null;
  } catch {
    return json(503, { error: 'Checkout protection is unavailable. Please try again later.' }, { 'Retry-After': '60' });
  }
}
