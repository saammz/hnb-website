import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Clock3, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { verifyPayment, type PaymentResult as PaymentDetails } from '@/lib/payments-api';

const money = (kobo: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(kobo / 100);

const PaymentResult = () => {
  const [params] = useSearchParams();
  const references = params.getAll('reference');
  const reference = references.length === 1 && /^[A-Za-z0-9.=_-]{1,100}$/.test(references[0]) ? references[0] : '';
  const [result, setResult] = useState<PaymentDetails | null>(null);
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const current = result?.reference === reference ? result : null;

  useEffect(() => {
    if (!reference) return;
    const controller = new AbortController();
    const deadline = Date.now() + 60000;
    let timer: ReturnType<typeof setTimeout>;
    const check = async () => {
      setChecking(true);
      setError('');
      try {
        const payment = await verifyPayment(reference, controller.signal);
        if (controller.signal.aborted) return;
        setResult(payment);
        if (payment.status === 'pending' && Date.now() + 5000 <= deadline) timer = setTimeout(check, 5000);
      } catch (cause) {
        if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : 'Please check your payment again.');
      } finally {
        if (!controller.signal.aborted) setChecking(false);
      }
    };
    void check();
    return () => { controller.abort(); clearTimeout(timer); };
  }, [reference, attempt]);

  const paid = current?.status === 'success';
  const simulated = paid && current.handshake?.status === 'success';
  const title = !reference ? 'Payment reference unavailable'
    : simulated ? 'Payment verified — EMR booking simulated'
    : paid ? 'Payment received; booking confirmation pending'
    : current?.status === 'pending' ? 'We’re confirming your payment'
    : current?.status === 'failed' ? 'Payment was not completed'
    : current?.status === 'abandoned' ? 'Payment is incomplete'
    : error ? 'We couldn’t verify your payment yet' : 'Checking your payment…';
  const Icon = simulated ? CheckCircle2 : error || !reference || current?.status === 'failed' ? AlertCircle : current ? Clock3 : LoaderCircle;

  return (
    <main className="min-h-screen bg-[#F4FFF8] px-4 py-12 sm:py-20">
      <div className="mx-auto max-w-xl rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm sm:p-10">
        <p className="text-sm font-medium text-emerald-700">Darlez Medical Diagnostics · Sandbox</p>
        <Icon className={`mt-8 h-10 w-10 text-emerald-600 ${checking && !current ? 'animate-spin' : ''}`} aria-hidden="true" />
        <div role="status" aria-live="polite" className="mt-4">
          <h1 className="text-2xl font-bold leading-tight text-gray-900">{title}</h1>
          <p className="mt-3 text-sm leading-relaxed text-gray-600">
            {!reference ? 'Open the return link from checkout in the same browser. If you already paid, contact the lab before starting another payment.'
              : simulated ? 'Your sandbox payment is confirmed. The EMR handoff is mocked: no hospital booking or appointment has been created.'
              : paid ? 'Do not pay again. You can retry booking confirmation below or contact the lab with your payment reference.'
              : current?.status === 'pending' ? 'Bank confirmation can take a few minutes. We check periodically for up to one minute; you can also check again below.'
              : current?.status === 'failed' ? 'You can return to your existing checkout to try the payment again.'
              : current?.status === 'abandoned' ? 'Crosspoint has not confirmed a payment. You can resume your existing checkout.'
              : 'We check directly with Crosspoint before confirming your payment.'}
          </p>
        </div>
        {error && <p role="alert" className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{error}</p>}
        {reference && (
          <dl className="mt-6 space-y-3 border-y border-gray-100 py-5 text-sm">
            <div><dt className="text-gray-500">Payment reference</dt><dd className="mt-1 break-all font-medium text-gray-900">{reference}</dd></div>
            {current && <div><dt className="text-gray-500">Test</dt><dd className="mt-1 font-medium text-gray-900">{current.service.name}</dd></div>}
            {paid && current.payment && <>
              <div><dt className="text-gray-500">Patient</dt><dd className="mt-1 break-words text-gray-900">{current.payment.customer.name || 'Patient'} · {current.payment.customer.email}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-gray-500">Test amount</dt><dd>{money(current.payment.amount)}</dd></div>
              {current.payment.customer_paid_fee && <>
                <div className="flex justify-between gap-4"><dt className="text-gray-500">Processing fee</dt><dd>{money(current.payment.fees)}</dd></div>
                <div className="flex justify-between gap-4 font-semibold"><dt>Total paid</dt><dd>{money(current.payment.amount + current.payment.fees)}</dd></div>
              </>}
              {!current.payment.customer_paid_fee && <div className="flex justify-between gap-4 font-semibold"><dt>Total paid</dt><dd>{money(current.payment.amount)}</dd></div>}
              {simulated && current.handshake?.status === 'success' && <div><dt className="text-gray-500">Simulated booking reference</dt><dd className="mt-1 break-all text-gray-900">{current.handshake.booking_reference}</dd></div>}
            </>}
          </dl>
        )}
        <div className="mt-6 flex flex-col gap-3">
          {reference && !simulated && <Button disabled={checking} onClick={() => setAttempt((value) => value + 1)} className="bg-emerald-500 text-white hover:bg-emerald-600">
            {checking ? <><LoaderCircle className="animate-spin" aria-hidden="true" /> Checking…</> : paid ? 'Retry booking confirmation' : 'Check payment again'}
          </Button>}
          {!error && current && ['failed', 'abandoned'].includes(current.status) && <Button asChild className="bg-emerald-500 text-white hover:bg-emerald-600"><a href={current.authorization_url}>Resume existing checkout</a></Button>}
          <Button asChild variant="outline"><Link to="/#test-directory">Return to test directory</Link></Button>
          <Button asChild variant="ghost"><Link to="/#contact">Contact the lab</Link></Button>
        </div>
      </div>
    </main>
  );
};

export default PaymentResult;
