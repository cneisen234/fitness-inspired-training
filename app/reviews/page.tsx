import type { Metadata } from 'next';
import { site } from '@/lib/site';
import { PulseLine } from '@/components/PulseLine';
import { Emblem } from '@/components/Logo';
import ReviewForm from '@/components/ReviewForm';
import ReviewList from '@/components/ReviewList';
import { getApprovedReviews } from '@/lib/reviews';

export const metadata: Metadata = {
  title: 'Reviews',
  description: `Read what clients say about training with ${site.trainer} at ${site.name} — and share your own experience.`,
};

export const dynamic = 'force-dynamic';

export default async function Reviews() {
  const approved = await getApprovedReviews();
  return (
    <>
      {/* ===================== Hero ===================== */}
      <section className="relative overflow-hidden dot-grid">
        <div className="container mx-auto px-4 pt-16 pb-14 md:pt-24 md:pb-16 text-center">
          <p className="eyebrow eyebrow-coral fade-up d-1">Reviews</p>
          <h1 className="mt-4 fade-up d-2 text-4xl md:text-6xl">
            Real people, <span style={{ color: 'var(--coral)' }}>real progress</span>
          </h1>
          <p className="mt-6 fade-up d-3 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed" style={{ color: 'var(--slate)' }}>
            Trained with {site.trainer}? Share how it went — your words help someone else take
            their first step.
          </p>
          <div className="mt-10 max-w-3xl mx-auto fade-up d-4">
            <PulseLine color="var(--coral)" height={44} draw />
          </div>
        </div>
      </section>

      {/* ===================== Approved reviews ===================== */}
      {approved.length > 0 && (
        <section className="section pb-4" style={{ backgroundColor: 'var(--paper)' }}>
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto">
              <p className="eyebrow">In their words</p>
              <h2 className="mt-3 text-3xl md:text-4xl">What clients say</h2>
              <div className="divider-pulse divider-pulse-on-paper mx-auto mt-6" />
            </div>
            <div className="mt-12">
              <ReviewList reviews={approved} />
            </div>
          </div>
        </section>
      )}

      {/* ===================== Leave a review ===================== */}
      <section
        className="section pt-4"
        style={{ backgroundColor: approved.length > 0 ? 'var(--paper)' : 'var(--cream)' }}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="panel accent-coral p-7 md:p-9">
              <h2 className="text-2xl md:text-3xl">Leave a review</h2>
              <p className="mt-2 mb-6 text-sm" style={{ color: 'var(--stone)' }}>
                Ashley reads every review personally and publishes it here once approved. Spam
                protection keeps this for real clients only.
              </p>
              <ReviewForm />
            </div>
          </div>
        </div>
      </section>

      {/* ===================== Closing band ===================== */}
      <section className="relative overflow-hidden lanes-dark" style={{ backgroundColor: 'var(--sky-deep)' }}>
        <div className="container mx-auto px-4 py-16 text-center relative">
          <Emblem width={92} color="#fff" className="mx-auto" />
          <p className="mt-5 text-lg max-w-xl mx-auto" style={{ color: 'rgba(234, 242, 248, 0.9)' }}>
            Thank you for being part of the {site.name} community.
          </p>
        </div>
      </section>
    </>
  );
}
