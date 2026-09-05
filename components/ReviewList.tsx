import type { PublicReview } from '@/lib/reviews';
import { StarIcon } from './Icons';

// Presentational grid of approved reviews. Shared by the homepage and the
// reviews page so both render identically.
export default function ReviewList({ reviews }: { reviews: PublicReview[] }) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {reviews.map((t, i) => (
        <figure
          key={t.id}
          className={`panel panel-spine accent-${['sky', 'coral', 'amber'][i % 3]} p-7 flex flex-col`}
        >
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <span
                key={n}
                style={{ color: n <= t.rating ? 'var(--amber)' : 'var(--border)', lineHeight: 0 }}
              >
                <StarIcon size={16} />
              </span>
            ))}
          </div>
          <blockquote
            className="mt-4 text-[0.98rem] leading-relaxed flex-1"
            style={{ color: 'var(--charcoal)' }}
          >
            &ldquo;{t.body}&rdquo;
          </blockquote>
          <figcaption className="mt-5 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
            <span className="font-extrabold text-sm block" style={{ color: 'var(--charcoal)' }}>
              {t.name}
            </span>
            {t.duration && (
              <span className="text-xs" style={{ color: 'var(--stone)' }}>
                {t.duration}
              </span>
            )}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
