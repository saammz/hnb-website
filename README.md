# 🛠️ Project Name

HnB Website built with **Vite**, **TypeScript**, **Tailwind CSS**, and **shadcn-ui**.

## Developer handoff — 11 November 2026

**Status: sandbox payment integration implemented; EMR handoff mocked.** The
payment changes have not been deployed to the hospital's hosted project. Complete
the remaining acceptance checks below before treating this as ready for patients.

### What is implemented

- Test-directory cards with **Book a Test**, required name/email dialog, loading
  protection and retryable errors. Search, department filters and pagination remain.
- Prices hidden in the directory and booking dialog. The server retrieves the
  selected EMR service's `walkin_price` and converts naira to kobo; the browser
  cannot supply the payment amount.
- Vercel functions for Crosspoint sandbox checkout creation and verification,
  server-only credentials and a signed 24-hour browser payment context.
- Checkout creation checks the shared Vercel Firewall rate limit before catalogue
  lookup or payment creation. Rate-limited requests return `429`; missing or
  unavailable protection returns `503`. The deployed firewall rule must be published
  by the project owner as described below.
- `/payment/result` with verification, pending-payment polling, checkout-resume
  links and recovery messages. Verification checks reference, checkout ID, amount,
  currency and service/organization metadata before handoff.
- Server-side mocked EMR handoff, deterministic `MOCK-...` booking reference and
  explicit simulated-confirmation copy. Failed handoff preserves paid status and
  offers retry rather than another payment.
- Environment examples, secret-file exclusions, test commands and a scoped Vercel
  callback rewrite. The previous catch-all rewrite intercepted Vite modules and
  has been removed.

### Validation recorded at handoff

| Check | Last recorded result |
| --- | --- |
| Server tests | 21 passed: 10 checkout creation and 11 verification/handoff tests |
| Client API tests | 5 passed; 26 server/client tests in total |
| Build and TypeScript | Passed |
| Lint | No errors; five existing React Fast Refresh warnings |
| Browser automation | Script exists, but execution was blocked by Chrome socket permissions in the agent environment; it has not passed there |
| Local routing | Vite client and source modules returned JavaScript, callback returned HTML, and checkout API returned the expected JSON `405` for GET |
| Direct Crosspoint sandbox test | User completed card payment and verified `status: success`, amount and EMR service metadata using cURL |
| Full HNB browser flow | Still needs confirmation: directory → form → payment → callback → verification → simulated EMR confirmation |

The direct Crosspoint test does not establish that the complete HNB callback flow
works. Automated payment tests mock upstream requests and create no real payments.
Rerun checks after changes rather than treating this dated record as a current run.

### Where to continue

| File | Responsibility |
| --- | --- |
| [TestDirectorySection.tsx](src/components/TestDirectorySection.tsx) | Test listing, filters and booking entry points |
| [BookingDialog.tsx](src/components/BookingDialog.tsx) | Patient details, submission and checkout redirect |
| [services-api.ts](src/lib/services-api.ts) | Public EMR catalogue and service types |
| [payments-api.ts](src/lib/payments-api.ts) | Frontend payment calls and response validation |
| [create.js](api/payments/create.js) | Trusted price lookup and sandbox initialization |
| [payment-session.js](server/payment-session.js) | Configuration, cookie signing and session validation |
| [verify.js](api/payments/verify.js) | Provider verification and handoff invocation |
| [emr-handshake.js](server/emr-handshake.js) | **Mock replacement point** for the real EMR endpoint |
| [PaymentResult.tsx](src/pages/PaymentResult.tsx) | Payment/recovery states and simulated booking confirmation |
| [vercel.json](vercel.json) | Server-function durations and callback rewrite |

### Remaining work, in order

1. **Finish local sandbox acceptance.** Use `npm run dev:vercel`, book a test with
   an email you control, complete a test payment and confirm return to HNB with
   the correct test, amount, fee and simulated booking reference. Also test refresh,
   pending/failed payment and missing-session recovery. Run the browser smoke test
   on a machine where Chrome can start.
2. **Obtain the real EMR contract.** Required: endpoint URL, authentication,
   required payload fields, success response and failure behavior. Do not invent
   endpoint variables or send credentials from the frontend.
3. **Replace the mock and update confirmation together.** Pass the verified
   payment response and service/organization details server-side. Update the
   server/client handshake schemas and page copy, which currently require
   `simulated: true`. Show real booking confirmation only after real EMR success.
4. **Validate the real handoff.** Check success, timeout/error and retry behavior.
   Include Crosspoint reference, checkout ID and order ID for reconciliation.
   The agreed backend policy permits duplicate submissions; HNB has no persistent
   deduplication. Do not claim exactly-once booking creation.
5. **Configure and deploy to the boss's Vercel project.** Obtain access or have the
   owner deploy; set environment variables on that project and use its exact origin
   for `APP_ORIGIN`. Repeat the complete sandbox flow on the deployment.
6. **Handle live activation separately.** Confirm Crosspoint's acceptance of
   diagnostic services, live credentials and outbound-IP requirements. Update and
   test the sandbox-only API/checkout URL restrictions deliberately; switching the
   token alone does not enable live mode.

### Accepted limits

Sandbox only; no real EMR booking or appointment is created. There is one active
payment context per browser and no durable payment store, webhook fulfilment or
background handoff recovery. Closing the browser before callback prevents automatic
handoff; missing/expired cookies require manual reference-based support. Repeated
verification can repeat the handoff under the agreed backend policy. Public API
responses still expose prices even though the directory UI hides them.

## 🚀 Getting Started

This guide will help you set up, run, and build the project locally.

### Prerequisites

Make sure you have the following installed on your system:

- **Node.js** (v22.12 or later): https://nodejs.org
- **npm** (comes with Node.js) or **Yarn**

To install Node.js using nvm:

```bash
nvm install 22
```

The npm overrides keep typography's selector parser, Sucrase's Glob, and TypeScript
ESLint's Minimatch on patched versions. Remove each override when its parent
dependency requires a patched version itself.

### Setup, Run, and Build

Follow these steps:

```bash
# 1. Clone the repository
git clone <GIT REPO>

# 2. Navigate to the project folder
cd your-project

# 3. Install project dependencies
npm install
# or
yarn install

# 4. Start the development server
npm run dev
# or
yarn dev

# 5. Build for production
npm run build
# or
yarn build

# 6. Preview the production build locally
npm run preview
# or
yarn preview
```

The frontend will be available during development at:
[http://localhost:8080](http://localhost:8080).

## Sandbox payments — Phase 1

The project includes `POST /api/payments/create`, a Vercel Node function.
It accepts only `{ "service_id": "<EMR ID>", "name": "Patient Name", "email": "patient@example.com" }`
and returns `{ "authorization_url": "https://sandbox.crosspoint.finance/checkout/..." }` with status `201`.
The request must use JSON and an `Origin` matching `APP_ORIGIN`.

The function retrieves the service from LightbaseMR for the configured organization,
uses only `walkin_price` (naira), converts it to kobo, and calls Crosspoint's
`POST /v1/naira/checkouts`. The browser cannot choose the amount or organization.
Prices must be numeric, represent whole kobo, and be within ₦200–₦2,000,000.
Card payments have Crosspoint's separate ₦1,000,000 limit; larger amounts use bank transfer.
Customer-paid fees can further affect the payment limits and displayed total.

### Environment setup

Keep existing settings and use [.env.example](.env.example) as the variable-name
reference. Local development currently uses git-ignored `.env`; `.env.local` can
also be used. Avoid conflicting values across the two files. Configure the same
server settings in Vercel's project environment variables for deployments:

| Variable | Value |
| --- | --- |
| `VITE_SERVICES_API_URL` | Public frontend catalogue URL; defaults to `https://api-prod.lightbasemr.com/public-services` |
| `VITE_ORG_SLUG` | Public frontend organization slug; defaults to `darlez` |
| `CROSSPOINT_ACCESS_TOKEN` | Sandbox organization token with `checkouts:write` and `checkouts:read` |
| `PAYMENT_SESSION_SECRET` | A random secret of at least 32 bytes; keep the same value across requests |
| `APP_ORIGIN` | `http://localhost:3000` locally; `https://hnb-website-woad.vercel.app` for that deployment |
| `SERVICES_API_URL` | Defaults to `https://api-prod.lightbasemr.com/public-services` |
| `ORG_SLUG` | Defaults to `darlez` |
| `CHECKOUT_FIREWALL_HOST` | Local development only: deployed Vercel hostname with the published checkout rate-limit rule; no scheme/path |

Generate the session secret locally with `openssl rand -hex 32`. Never prefix these
server variables with `VITE_`, expose them in browser code, or commit them.
For Vercel previews, set `APP_ORIGIN` to the exact preview origin used for testing.
The server and frontend catalogue configuration must refer to the same organization.
Redeploy after changing deployed environment variables.

### Checkout abuse protection — required project setup

The `Origin` check prevents cross-origin browser requests; it does not authenticate
automated clients. After validating the request body and before any catalogue or
Crosspoint call, creation uses `@vercel/firewall` to check the shared rule
**hnb-checkout-create**. No per-process counter or allow-all fallback is used.

The owner of **each deployment project** must configure and publish this rule:

1. Open the project's **Firewall → Configure → New Rule**.
2. Select the **@vercel/firewall** condition, with Rate limit ID
   **hnb-checkout-create**. Do not add a path condition matching the original API
   URL: the SDK calls Vercel's rate-limit endpoint on its behalf.
3. Configure a fixed 60-second window with **5 requests** and a rate-limit/429
   action. Keep the default client-IP bucket; do not use log-only mode.
4. Save, review and publish the rule. The application and rule must exist on the
   intended Vercel project; the separate local-development project does not
   configure the boss's project.
5. Test on the deployment: the sixth valid creation attempt within the window
   must return `429`, not create another checkout. These checks create sandbox
   sessions, so use sandbox credentials. Confirm missing rules fail with `503`.

The function passes Vercel's client-IP headers to the SDK and uses the configured
`APP_ORIGIN` host rather than a caller-selected host. Counters are shared across
function instances but are regional, as documented by Vercel. IP limits can also
group people sharing a network; adjust the published threshold only after observing
legitimate traffic. Rate limiting is not authentication or complete DDoS protection.

For local `dev:vercel`, set `CHECKOUT_FIREWALL_HOST` to a deployed hostname with
this published rule (for example, your separate development project's hostname).
Local requests use one shared **hnb-local-development** bucket. Without this host,
the SDK would skip enforcement in development; HNB explicitly blocks with `503`
instead. Preview/protected deployments may also need Vercel's automation bypass
and exposed system environment variables configured according to the SDK docs.

Over-limit responses contain a readable JSON error and `Retry-After: 60`. A
missing rule, malformed firewall response or timeout (1.5 seconds) fails closed
with `503` and makes no EMR/Crosspoint calls. Invalid requests rejected before the
guard do not consume the SDK rule's quota. Verification is separate and is not
throttled by the checkout-creation rule.

See [Vercel's Rate Limiting SDK documentation](https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting-sdk).
Server tests mock the SDK's HTTP responses and cover five allowed requests, the
sixth blocked request with no additional business upstream calls, firewall failures,
and explicit local-development configuration. Actual deployed enforcement still
requires the project rule and a deployment acceptance check.

### Local development and checks

Run `npm run dev:vercel` from this directory. Open `http://localhost:3000`.
The current local CLI link is the developer's separate **hnb-local-dev** project;
the hosted HNB project belongs to the boss. The link is stored in git-ignored
`.vercel`, so a new checkout may prompt for login and project setup. Link the boss's
project only if you have access. Otherwise create a separate local-development
project, accept the detected Vite defaults and decline Git repository integration.
Running `dev:vercel` does not deploy the app. Do not run deployment commands or
connect the repository to the development project as part of local setup.
The regular `npm run dev` command serves only the frontend, without the API function.
Keep the Vercel project's Development Command as `npm run dev`, not `dev:vercel`.
Only `/payment/result` is rewritten to the app entry point. Do not add a global
rewrite to `index.html`: it can intercept Vite's development module URLs and cause
HTML to be parsed as JavaScript. Restart `dev:vercel` after routing changes.

Run `npm run test:payments` for mocked upstream tests, `npm run lint` for static
checks, and `npm run build` for the frontend build. Tests do not use your token or
create real sandbox checkouts. `@vercel/firewall` supplies shared server-side rate
checks; the tests also mock its HTTP requests.

### Test booking — Phase 2

Each test-directory card now offers **Book a Test**. The dialog collects required
name and email, then calls the same-origin creation function and redirects to
Crosspoint's sandbox. Prices stay hidden on cards and in the dialog. The browser
never sends a price or stores patient details in local storage. Search, department
filters and pagination are unchanged; navigation/contact booking buttons still
lead to the contact section.

Validation errors keep the form open for retry. While creating checkout, submission
and dismissal are disabled to avoid duplicate requests. Dismissing the dialog
clears its fields. Use `npm run dev:vercel` with server environment settings to try
the integration; plain Vite cannot serve `/api/payments/create`.

Run `npm run test:checkout-client` for request/error/redirect validation tests.
For browser checks, first run `npm run build`, then `npm run test:booking`.
The browser script needs local Google Chrome (`CHROME_BINARY` can override the
executable). It loads the built app with mocked services and payment responses;
it creates no real checkouts and writes a mobile screenshot to the system temp
directory as `hnb-booking-mobile.png`.

### Verification and simulated booking — Phases 3–5

Crosspoint returns to `/payment/result?reference=...&trxref=...`. The page uses only
`reference` to call `POST /api/payments/verify` with `{ "reference": "..." }`.
That server function validates the signed browser session, calls the sandbox
verification API and compares the reference, checkout ID, amount, NGN currency,
EMR service ID and organization. A success must include an order ID and paid time.
A callback URL alone cannot confirm payment. Responses are never cached.

The browser receives the verified status, reference, service name/ID and a safe
resume-checkout URL. A paid response additionally includes the payment summary
(amount, fees, who paid them, channel, date, order ID and customer name/email) and
the handshake result. The complete provider response stays server-side.

`pending` payments are rechecked every five seconds for up to one minute without
overlapping requests. The patient can recheck manually afterward. Failed or
abandoned payments can resume the original checkout; API errors, mismatches and
missing/expired sessions instruct patients to check with the lab before paying
again. Leaving the result page cancels polling.

After successful payment verification, `server/emr-handshake.js` receives the
organization and service details, expected amount/currency, verified customer and
complete provider verification response. It currently returns a deterministic
`MOCK-<PAYMENT_REFERENCE>` booking reference with `simulated: true`. The page says
**Payment verified — EMR booking simulated**; no hospital record or appointment is
created. If handoff fails, payment remains successful and the page offers
**Retry booking confirmation**. Every retry reverifies with Crosspoint first.

To integrate the real EMR later, replace the mock with the authenticated server-side
request once its URL, authentication and payload/response contract are available.
Update the handshake response schema and UI copy together so only real confirmed
bookings receive real confirmation. Include payment reference, checkout ID and
order ID for reconciliation; repeated submissions are permitted under the current
backend policy. Never accept browser-supplied verification data as proof of payment.

Run `npm run test:payments` for server creation/verification/handoff tests and
`npm run test:checkout-client` for client request/response checks. The browser test
also covers callback polling, simulated confirmation, handoff retry and recovery
states. Build before running `npm run test:booking`.

### Current limits

Successful creation sets a signed, HttpOnly, SameSite=Lax cookie scoped to
`/api/payments`, secure on HTTPS, expiring after 24 hours. It contains expected
payment and service details and the resume URL, not the access token or card
details. Signing detects changes; it is not encryption. One browser has one active
context, so a new checkout replaces the old one.
Use the same browser for checkout and return. Older payment cookies without the
resume URL, expired cookies, another browser, or browser storage clearing require
manual reference-based support; the website must not treat these cases as unpaid.

The public catalogue currently ignores a `service_id` filter, so the function scans
pages until it finds the service, within a 15-second catalogue deadline. Direct
lookup should replace this when the EMR exposes it. Crosspoint calls have a
10-second timeout; a timeout can leave a created but unpaid checkout upstream.
No automatic creation retries, webhook fulfilment, database or background handoff
retries are included. Closing the browser before callback prevents automatic EMR
handoff. The mock performs no external request or persistent write, and repeated
verification returns the same mock reference. The API base is fixed to sandbox;
no live payments are enabled by this implementation.

## 🧰 Tech Stack

- ⚛️ [React](https://reactjs.org/)
- ⚡ [Vite](https://vitejs.dev/)
- 🛡️ [TypeScript](https://www.typescriptlang.org/)
- 💨 [Tailwind CSS](https://tailwindcss.com/)
- 🎨 [shadcn-ui](https://ui.shadcn.com/)

## 📁 Project Structure

```bash
src/
├── assets/        # Static assets
├── components/    # Reusable UI components
├── pages/         # Page-level components
├── styles/        # Global and utility styles
├── App.tsx        # Root component
├── main.tsx       # Application entry point
```

## 🌐 Deployment

The payment integration uses Vercel Node functions in `api/`; deploy the full app
to the intended Vercel project with its root directory set to `hnb-website` when
deploying from the parent workspace, or the repository root when this folder is
the repository itself. Use the Vite preset, build command `npm run build` and
output directory `dist`. The Development Command must launch Vite, not recursively
run `dev:vercel`.

Deployment to the boss's project requires access or action by its owner. Set the
variables listed above in that project's environment settings, keep all payment
credentials server-only, and set `APP_ORIGIN` to the exact deployed origin without
a trailing slash. Redeploy after environment changes and repeat sandbox acceptance.
Preview origins need matching configuration. Do not deploy to `hnb-local-dev` or
enable Git integration there unintentionally.

`npm run preview` serves the built frontend only; it does not run the payment
functions. Other hosts need equivalent server-function hosting and routing changes;
uploading `dist` alone is not a working payment deployment.

## 📝 License

No `LICENSE` file is currently included in this repository.
