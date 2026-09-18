'use client';

import { useState } from 'react';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import type { Appearance } from '@stripe/stripe-js';
import { getStripe } from '@/lib/stripe-client';
import { formatCents } from '@/lib/money';

type Plan = { id: string; name: string; priceCents: number };

// Brand the Stripe iframe fields to match the site.
const appearance: Appearance = {
  theme: 'stripe',
  variables: {
    colorPrimary: '#f2765c',
    colorText: '#253340',
    colorDanger: '#d85c43',
    fontFamily: 'Nunito Sans, system-ui, sans-serif',
    borderRadius: '12px',
    spacingUnit: '4px',
  },
};

const fieldStyle: React.CSSProperties = {
  width: '100%',
  borderRadius: '0.75rem',
  border: '1.5px solid var(--border)',
  backgroundColor: 'var(--paper)',
  padding: '0.7rem 0.9rem',
  color: 'var(--charcoal)',
  fontSize: '0.95rem',
};

export default function CheckoutForm({ plan }: { plan: Plan }) {
  return (
    <Elements
      stripe={getStripe()}
      options={{ mode: 'payment', amount: plan.priceCents, currency: 'usd', appearance }}
    >
      <InnerForm plan={plan} />
    </Elements>
  );
}

function InnerForm({ plan }: { plan: Plan }) {
  const stripe = useStripe();
  const elements = useElements();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [goals, setGoals] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setError('');
    setSubmitting(true);

    // Validate the Payment Element fields first (deferred-intent flow).
    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message ?? 'Please check your card details.');
      setSubmitting(false);
      return;
    }

    // Create the PaymentIntent server-side (amount from the DB), get its secret.
    let clientSecret: string;
    try {
      const res = await fetch('/api/checkout/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: plan.id, name, email, goals }),
      });
      const data = (await res.json()) as { ok: boolean; clientSecret?: string; message?: string };
      if (!res.ok || !data.ok || !data.clientSecret) {
        throw new Error(data.message || 'Could not start checkout.');
      }
      clientSecret = data.clientSecret;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setSubmitting(false);
      return;
    }

    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        return_url: `${window.location.origin}/plans/success`,
        payment_method_data: { billing_details: { name, email } },
      },
      redirect: 'if_required',
    });

    if (confirmError) {
      setError(confirmError.message ?? 'Payment could not be completed.');
      setSubmitting(false);
      return;
    }

    // Card success returns here (no redirect); personalize the success page.
    window.location.href = paymentIntent
      ? `/plans/success?payment_intent=${paymentIntent.id}`
      : '/plans/success';
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <label className="block">
          <Label>Name</Label>
          <input
            type="text"
            required
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jamie Rivera"
            style={fieldStyle}
          />
        </label>
        <label className="block">
          <Label>Email</Label>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            style={fieldStyle}
          />
        </label>
      </div>

      <label className="block">
        <Label>Your goals (optional)</Label>
        <textarea
          rows={3}
          value={goals}
          onChange={(e) => setGoals(e.target.value)}
          placeholder="What are you hoping to work on? Helps Ashley tailor your Everfit plan."
          style={fieldStyle}
        />
      </label>

      <div>
        <Label>Payment</Label>
        <div
          style={{
            borderRadius: '0.75rem',
            border: '1.5px solid var(--border)',
            backgroundColor: 'var(--paper)',
            padding: '0.9rem',
          }}
        >
          <PaymentElement options={{ layout: 'tabs' }} />
        </div>
      </div>

      {error && (
        <p
          className="text-sm rounded-xl px-4 py-3"
          style={{ backgroundColor: 'var(--coral-soft)', color: 'var(--coral-deep)', fontWeight: 600 }}
          role="alert"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={!stripe || submitting}
        className="btn btn-coral w-full text-lg"
        style={!stripe || submitting ? { opacity: 0.7 } : undefined}
      >
        {submitting ? 'Processing…' : `Pay ${formatCents(plan.priceCents)}`}
      </button>

      <p className="text-xs text-center leading-relaxed" style={{ color: 'var(--stone)' }}>
        Secure payment powered by Stripe. Your card details never touch our servers.
      </p>
    </form>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="block mb-1.5 text-sm font-bold" style={{ color: 'var(--charcoal)' }}>
      {children}
    </span>
  );
}
