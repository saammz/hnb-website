import { createHmac, timingSafeEqual } from 'node:crypto';
import { z } from 'zod';

export const SANDBOX_API = 'https://sandbox-api.crosspoint.finance';
export const checkoutUrlSchema = z.url().refine((value) => {
  const url = new URL(value);
  return url.origin === 'https://sandbox.crosspoint.finance' && !url.username && !url.password &&
    url.pathname.startsWith('/checkout/');
});

const contextSchema = z.object({
  reference: z.string().min(1).max(100),
  checkout_id: z.uuid(),
  authorization_url: checkoutUrlSchema,
  amount: z.number().int().min(20000).max(200000000),
  currency: z.literal('ngn'),
  organization: z.object({ id: z.string().min(1), slug: z.string().min(1) }),
  service: z.object({ id: z.string().regex(/^[a-f\d]{24}$/i), name: z.string().min(1), department: z.string(), category: z.string() }),
  expires_at: z.number().int().positive(),
});

export function paymentConfig() {
  const { CROSSPOINT_ACCESS_TOKEN: token, PAYMENT_SESSION_SECRET: secret, APP_ORIGIN } = process.env;
  const url = new URL(APP_ORIGIN);
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  if (url.origin !== APP_ORIGIN || (url.protocol !== 'https:' && !(local && url.protocol === 'http:')) ||
      !token || !secret || Buffer.byteLength(secret) < 32) throw new Error('Invalid payment configuration');
  return { token, secret, appOrigin: url.origin };
}

export function json(status, body, headers = {}) {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store', ...headers } });
}

export function paymentCookie(context, secret, appOrigin) {
  const encoded = Buffer.from(JSON.stringify(contextSchema.parse(context))).toString('base64url');
  const signature = createHmac('sha256', secret).update(encoded).digest('base64url');
  const secure = appOrigin.startsWith('https:') ? '; Secure' : '';
  const cookie = `hnb_payment_context=${encoded}.${signature}; HttpOnly; SameSite=Lax; Path=/api/payments; Max-Age=86400${secure}`;
  if (Buffer.byteLength(cookie) > 4096) throw new Error('Payment context exceeds cookie limit');
  return cookie;
}

export function readPaymentContext(request, secret) {
  const cookies = (request.headers.get('cookie') || '').split(';').map((cookie) => cookie.trim())
    .filter((cookie) => cookie.startsWith('hnb_payment_context='));
  if (cookies.length !== 1 || cookies[0].length > 4096) throw new Error('Missing payment context');
  const value = cookies[0].slice('hnb_payment_context='.length);
  const match = /^([A-Za-z0-9_-]+)\.([A-Za-z0-9_-]{43})$/.exec(value);
  if (!match) throw new Error('Invalid payment context');
  const expected = createHmac('sha256', secret).update(match[1]).digest();
  const actual = Buffer.from(match[2], 'base64url');
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) throw new Error('Invalid signature');
  const context = contextSchema.parse(JSON.parse(Buffer.from(match[1], 'base64url').toString('utf8')));
  if (context.expires_at <= Date.now()) throw new Error('Expired payment context');
  return context;
}
