import Link from 'next/link';
import Image from 'next/image';
import { site, navLinks } from '@/lib/site';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto">

      <div className="relative overflow-hidden lanes-dark" style={{ backgroundColor: 'var(--ink)' }}>
        <div className="container mx-auto px-4 py-16 relative">
          <div className="grid gap-10 md:grid-cols-3">
            {/* Brand — her real logo, knocked out to white on the dark band */}
            <div>
              <Image
                src="/FIT-Logo-alpha.png"
                alt={`${site.name} logo`}
                width={1560}
                height={2000}
                className="h-auto w-40"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
              <p className="mt-5 text-sm leading-relaxed max-w-xs" style={{ color: 'rgba(234, 242, 248, 0.72)' }}>
                Personalized strength and fitness coaching — in person or online — built around your goals.
              </p>
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--sky)' }}>
                Est. {site.established}
              </p>
            </div>

            {/* Explore */}
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-[0.2em] mb-4" style={{ color: 'var(--sky)' }}>
                Explore
              </h3>
              <ul className="space-y-2.5">
                {navLinks.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm font-semibold transition-colors hover:text-white"
                      style={{ color: 'rgba(234, 242, 248, 0.72)' }}
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Get in touch */}
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-[0.2em] mb-4" style={{ color: 'var(--sky)' }}>
                Get in Touch
              </h3>
              <p className="text-sm leading-relaxed mb-3" style={{ color: 'rgba(234, 242, 248, 0.72)' }}>
                Ready to start, or have a question? The contact page is the fastest way to reach me.
              </p>
              <div className="mt-4">
                <Link href="/contact" className="btn btn-light text-sm">
                  Start Training
                </Link>
              </div>
            </div>
          </div>

          {/* Baseline */}
          <div
            className="mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs"
            style={{ borderTop: '1px solid rgba(234, 242, 248, 0.14)', color: 'rgba(234, 242, 248, 0.55)' }}
          >
            <p>&copy; {year} {site.name}. All rights reserved.</p>
            <p>
              Site by{' '}
              <a
                href="https://kindlingdigital.org"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold transition-colors hover:text-white"
                style={{ color: 'rgba(234, 242, 248, 0.75)' }}
              >
                Kindling Digital
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
