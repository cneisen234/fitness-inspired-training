import type { Metadata } from 'next';
import { site } from '@/lib/site';
import { PulseLine } from '@/components/PulseLine';
import { Emblem } from '@/components/Logo';
import { Icon } from '@/components/Icons';
import ContactForm from '@/components/ContactForm';

export const metadata: Metadata = {
  title: 'Contact',
  description: `Get in touch with ${site.name} to start in-person or online training with ${site.trainer}.`,
};

const steps = [
  { title: 'You reach out', body: 'Tell me your goals and how you’d like to train — in person, online, or a mix.' },
  { title: 'We talk it through', body: 'I’ll follow up to learn more and recommend the right way to get started.' },
  { title: 'We start training', body: 'I build your plan and we get to work — in the gym or in your Everfit app.' },
];

export default function Contact() {
  return (
    <>
      {/* ===================== Hero ===================== */}
      <section className="relative overflow-hidden dot-grid">
        <div className="container mx-auto px-4 pt-16 pb-14 md:pt-24 md:pb-16 text-center">
          <p className="eyebrow eyebrow-coral fade-up d-1">Contact</p>
          <h1 className="mt-4 fade-up d-2 text-4xl md:text-6xl">
            Let&apos;s get <span style={{ color: 'var(--coral)' }}>started</span>
          </h1>
          <p className="mt-6 fade-up d-3 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed" style={{ color: 'var(--slate)' }}>
            Ready to train, or just have a question? Reach out and we&apos;ll figure out the best way to hit your goals together.
          </p>
          <div className="mt-10 max-w-3xl mx-auto fade-up d-4">
            <PulseLine color="var(--coral)" height={44} draw />
          </div>
        </div>
      </section>

      {/* ===================== Form + details ===================== */}
      <section className="section pt-4" style={{ backgroundColor: 'var(--cream)' }}>
        <div className="container mx-auto px-4">
          <div className="grid gap-8 lg:grid-cols-5 max-w-5xl mx-auto">
            {/* The contact form */}
            <div className="lg:col-span-3">
              <div className="panel accent-coral p-7 md:p-9">
                <h2 className="text-2xl md:text-3xl">Reach out</h2>
                <p className="mt-2 mb-6 text-sm" style={{ color: 'var(--stone)' }}>
                  Ask about training, or leave a review if we&apos;ve worked together. Spam protection keeps this inbox for real people only.
                </p>
                <ContactForm />
              </div>
            </div>

            {/* Contact details + what to expect */}
            <div className="lg:col-span-2 space-y-6">

              <div className="panel panel-spine accent-amber p-7">
                <h3 className="text-xl">What happens next</h3>
                <ol className="mt-4 space-y-4">
                  {steps.map((s, i) => (
                    <li key={s.title} className="flex gap-3">
                      <span
                        className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-sm wordmark"
                        style={{ color: '#fff', backgroundColor: 'var(--coral)' }}
                      >
                        {i + 1}
                      </span>
                      <div>
                        <span className="block font-extrabold text-sm" style={{ color: 'var(--charcoal)' }}>{s.title}</span>
                        <span className="text-sm" style={{ color: 'var(--slate)' }}>{s.body}</span>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== Closing band ===================== */}
      <section className="relative overflow-hidden lanes-dark" style={{ backgroundColor: 'var(--sky-deep)' }}>
        <div className="container mx-auto px-4 py-16 text-center relative">
          <Emblem width={92} color="#fff" className="mx-auto" />
          <p className="mt-5 text-lg max-w-xl mx-auto" style={{ color: 'rgba(234, 242, 248, 0.9)' }}>
            However you want to train, it starts with a message. I&apos;m looking forward to hearing from you.
          </p>
        </div>
      </section>
    </>
  );
}
