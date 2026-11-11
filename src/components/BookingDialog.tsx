import { useEffect, useRef, useState, type FormEvent } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { ArrowUpRight, LoaderCircle, ShieldCheck, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PublicService } from '@/lib/services-api';
import { createPaymentCheckout } from '@/lib/payments-api';

const fieldClass = 'mt-2 w-full h-12 rounded-lg border border-gray-300 bg-white px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-60';

const BookingDialog = ({ service }: { service: PublicService }) => {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const submitting = useRef(false);
  const nameInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const restore = (event: PageTransitionEvent) => {
      if (event.persisted) {
        submitting.current = false;
        setPending(false);
      }
    };
    window.addEventListener('pageshow', restore);
    return () => window.removeEventListener('pageshow', restore);
  }, []);

  const changeOpen = (next: boolean) => {
    if (submitting.current) return;
    setError('');
    setOpen(next);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting.current) return;
    const form = event.currentTarget;
    const nameField = form.elements.namedItem('name') as HTMLInputElement;
    const fields = new FormData(form);
    const name = String(fields.get('name') ?? '').trim();
    const email = String(fields.get('email') ?? '').trim();
    if (!name) {
      nameField.setCustomValidity('Enter your full name.');
      nameField.reportValidity();
      return;
    }

    submitting.current = true;
    setPending(true);
    setError('');
    try {
      const url = await createPaymentCheckout({ service_id: service.id, name, email });
      window.location.assign(url);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'We couldn’t open checkout. Please try again.');
      submitting.current = false;
      setPending(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={changeOpen}>
      <Dialog.Trigger asChild>
        <Button
          className="mt-auto w-full bg-emerald-500 hover:bg-emerald-600 text-white"
          aria-label={`Book a Test: ${service.name}`}
        >
          Book a Test <ArrowUpRight aria-hidden="true" />
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-[61] w-[calc(100%-2rem)] max-w-lg max-h-[90dvh] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-white p-6 sm:p-8 shadow-2xl focus:outline-none"
          onEscapeKeyDown={(event) => { if (submitting.current) event.preventDefault(); }}
          onPointerDownOutside={(event) => { if (submitting.current) event.preventDefault(); }}
          onInteractOutside={(event) => { if (submitting.current) event.preventDefault(); }}
          onOpenAutoFocus={(event) => { event.preventDefault(); nameInput.current?.focus(); }}
        >
          <Dialog.Close asChild>
            <button type="button" disabled={pending} aria-label="Close booking form" className="absolute right-4 top-4 rounded-md p-2 text-gray-500 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:opacity-40">
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </Dialog.Close>
          <Dialog.Title className="pr-8 text-2xl font-bold text-gray-900">Book your test</Dialog.Title>
          <Dialog.Description className="mt-2 text-sm leading-relaxed text-gray-600">
            Enter your details, then review the price and pay on Crosspoint’s secure checkout.
          </Dialog.Description>
          <div className="mt-6 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">Selected test</p>
            <p className="mt-1 font-semibold text-gray-900 break-words">{service.name}</p>
            <p className="mt-1 text-sm text-gray-600 break-words">{service.department}</p>
          </div>
          <form onSubmit={submit} className="mt-6 space-y-5" aria-busy={pending}>
            <label className="block text-sm font-medium text-gray-800">
              Full name
              <input ref={nameInput} name="name" type="text" autoComplete="name" required maxLength={200} disabled={pending}
                onInput={(event) => event.currentTarget.setCustomValidity('')}
                className={fieldClass} placeholder="Your full name" />
            </label>
            <label className="block text-sm font-medium text-gray-800">
              Email
              <input name="email" type="email" autoComplete="email" required maxLength={254} disabled={pending}
                className={fieldClass} placeholder="you@example.com" aria-describedby={`receipt-${service.id}`} />
            </label>
            <p id={`receipt-${service.id}`} className="!mt-2 text-xs text-gray-500">Your payment receipt will be sent to this email.</p>
            {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            <Button type="submit" disabled={pending} className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white">
              {pending ? <><LoaderCircle className="animate-spin" aria-hidden="true" /> Opening checkout…</> : <>Continue to checkout <ArrowUpRight aria-hidden="true" /></>}
            </Button>
            <p role="status" className="flex items-center justify-center gap-2 text-xs text-gray-500">
              <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
              {pending ? 'Please wait while we prepare your checkout.' : 'Payment is handled securely by Crosspoint.'}
            </p>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default BookingDialog;
