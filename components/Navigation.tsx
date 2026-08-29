'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { navLinks } from '@/lib/site';
import { EmblemBadge } from './Logo';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // Subtle backdrop blur once the page is scrolled.
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll while the full-screen menu is open.
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      <nav
        className="sticky top-0 z-50 transition-all"
        style={{
          backgroundColor: scrolled ? 'rgba(243, 248, 251, 0.88)' : 'var(--cream)',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none',
          borderBottom: `1px solid ${scrolled ? 'rgba(44, 110, 155, 0.22)' : 'transparent'}`,
        }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-18 py-3">
            {/* Wordmark — the pulse badge + business name */}
            <Link
              href="/"
              className="flex items-center gap-2.5 group"
              onClick={() => setIsOpen(false)}
            >
              <EmblemBadge size={44} className="transition-transform group-hover:-rotate-3 group-hover:scale-105" />
              <span className="leading-none">
                <span className="block wordmark text-xl md:text-[1.35rem]" style={{ color: 'var(--charcoal)' }}>
                  Fitness Inspired
                </span>
                <span
                  className="block text-[0.6rem] font-extrabold uppercase tracking-[0.32em] mt-0.5"
                  style={{ color: 'var(--coral-deep)', fontFamily: 'var(--font-nunito-sans)' }}
                >
                  Training
                </span>
              </span>
            </Link>

            {/* Desktop links */}
            <ul className="hidden md:flex items-center gap-1" style={{ fontFamily: 'var(--font-nunito-sans)' }}>
              {navLinks.map((l) => {
                const active = pathname === l.href;
                return (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="relative px-3.5 py-2 text-sm font-bold transition-colors hover:opacity-70"
                      style={{ color: active ? 'var(--sky-deep)' : 'var(--charcoal)' }}
                    >
                      {l.label}
                      <span
                        className="absolute left-1/2 -translate-x-1/2 bottom-0.5 w-1.5 h-1.5 rounded-full transition-opacity"
                        style={{ backgroundColor: 'var(--coral)', opacity: active ? 1 : 0 }}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Right side: primary CTA (desktop) */}
            <div className="hidden md:block">
              <Link href="/contact" className="btn btn-coral text-sm">
                Start Training
              </Link>
            </div>

            {/* Hamburger — mobile only */}
            <button
              className="md:hidden relative w-10 h-10 flex items-center justify-center rounded-full transition-colors"
              style={{ backgroundColor: isOpen ? 'var(--sky-deep)' : 'rgba(79, 159, 212, 0.16)' }}
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isOpen}
            >
              <div className="relative w-5 h-4 flex flex-col justify-between">
                <span
                  className="block h-0.5 w-full transition-all origin-center rounded-full"
                  style={{
                    backgroundColor: isOpen ? 'var(--bone)' : 'var(--charcoal)',
                    transform: isOpen ? 'rotate(45deg) translate(4px, 5px)' : 'none',
                  }}
                />
                <span
                  className="block h-0.5 w-full transition-all rounded-full"
                  style={{ backgroundColor: isOpen ? 'var(--bone)' : 'var(--charcoal)', opacity: isOpen ? 0 : 1 }}
                />
                <span
                  className="block h-0.5 w-full transition-all origin-center rounded-full"
                  style={{
                    backgroundColor: isOpen ? 'var(--bone)' : 'var(--charcoal)',
                    transform: isOpen ? 'rotate(-45deg) translate(4px, -5px)' : 'none',
                  }}
                />
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Full-screen mobile overlay */}
      <div
        className={`md:hidden fixed inset-0 z-40 transition-all duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        style={{ backgroundColor: 'var(--ink)' }}
      >
        {/* Ambient glow */}
        <div
          className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-30 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, var(--sky) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }}
        />
        <div
          className="absolute bottom-0 left-0 w-[420px] h-[420px] rounded-full opacity-25 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, var(--coral) 0%, transparent 70%)', transform: 'translate(-30%, 30%)' }}
        />

        <div className="relative h-full flex flex-col pt-24 pb-10 px-8">
          <nav className="flex-1 flex flex-col justify-center">
            <ul className="space-y-1">
              {navLinks.map((l, idx) => {
                const active = pathname === l.href;
                return (
                  <li
                    key={l.href}
                    className={isOpen ? 'fade-up' : ''}
                    style={{ animationDelay: `${idx * 60}ms` }}
                  >
                    <Link href={l.href} onClick={() => setIsOpen(false)} className="group flex items-baseline py-2.5">
                      <span
                        className="wordmark text-4xl transition-colors"
                        style={{ color: active ? 'var(--coral)' : 'var(--bone)' }}
                      >
                        {l.label}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* CTA at the bottom of the overlay */}
          <div className="pt-8" style={{ borderTop: '1px solid rgba(234, 242, 248, 0.2)' }}>
            <p className="text-sm mb-4" style={{ color: 'rgba(234, 242, 248, 0.7)' }}>
              Ready to get started?
            </p>
            <Link href="/contact" onClick={() => setIsOpen(false)} className="btn btn-coral w-full text-lg">
              Start Training
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
