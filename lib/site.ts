// ---------------------------------------------------------------------------
// Fitness Inspired Training — single source of truth.
//
// Every business fact the site renders lives here. What's transcribed from the
// discovery call with Ashley (the owner/trainer) is treated as verified; a few
// details we don't have yet — her contact address, phone, real client
// testimonials, social links — are marked `placeholder: true` and surfaced with
// a visible tag so nothing invented ships silently.
//
// Honesty rule: we do NOT publish numbers or claims we can't back up. Ashley
// gave us her years of experience and how she actually trains people; that's
// what we lean on. Placeholders stay obviously provisional until she confirms.
// ---------------------------------------------------------------------------

export const site = {
  name: "Fitness Inspired Training",
  // "Personal Training" descriptor from her logo lockup.
  descriptor: "Personal Training",
  // The trainer, in her own framing from the call.
  trainer: "Ashley",
  // From her logo: EST. 2018 (2018 → 2026 = 8 years, matching "over the last eight years").
  established: 2018,
  yearsExperience: 8,

  // Her actual motto — straight off her logo. This is the brand voice.
  tagline: "You do not find will power, you create it.",
  // One-sentence positioning for hero + meta description.
  intro:
    "Personalized strength and fitness coaching — in person or online — built around your goals, your schedule, and how your body actually moves.",
  // A warmer paragraph for the homepage welcome + about teaser.
  blurb:
    "I'm Ashley, and I've spent the better part of a decade helping people get stronger, move better, and finally reach the goals they couldn't crack on their own. No cookie-cutter programs — every plan is built around you, whether we're training together in person or dialing it in from wherever life takes you.",

  // --- Contact — NOT yet confirmed. Placeholders until Ashley sends details. ---
  email: "hello@fitnessinspiredtraining.com",
  emailHref: "mailto:hello@fitnessinspiredtraining.com",
  contactPlaceholder: true,

  // --- Social — unknown at time of build. ---
  social: {
    instagram: "",
    facebook: "",
    placeholder: true,
  },
} as const;

// ---- How Ashley trains ------------------------------------------------------
// Straight from the call: in-person for anyone (especially newer lifters), online
// for experienced clients / travelers via Everfit, and a hybrid mix of both.
export type Service = {
  key: string;
  name: string;
  tagline: string;
  description: string;
  points: string[];
  accent: "sky" | "coral" | "amber";
  icon: "dumbbell" | "device" | "blend";
  featured?: boolean;
};

export const services: Service[] = [
  {
    key: "in-person",
    name: "In-Person Training",
    tagline: "Hands-on coaching, start to finish",
    description:
      "One-on-one sessions where we build your foundation together — form, technique, and a plan that meets you exactly where you are. Ideal if you're newer to lifting or want eyes on every rep.",
    points: [
      "Personalized, progressive programming",
      "Real-time form and technique coaching",
      "Great for building a strong foundation",
    ],
    accent: "coral",
    icon: "dumbbell",
    featured: true,
  },
  {
    key: "online",
    name: "Online Training",
    tagline: "Your program, wherever you are",
    description:
      "Custom workouts delivered through the Everfit app — a calendar of sessions with video demos, sets, reps, and notes I write just for you. Built for experienced clients who know their form and travel or train on their own schedule.",
    points: [
      "Custom programs in the Everfit app",
      "Video demos, sets, reps + coaching notes",
      "Perfect for travel and busy schedules",
    ],
    accent: "sky",
    icon: "device",
  },
  {
    key: "hybrid",
    name: "Hybrid Coaching",
    tagline: "The best of both",
    description:
      "Mix in-person sessions with online programming — for example, train together some days and follow your Everfit plan the rest. We shape the blend around your week and your goals.",
    points: [
      "Combine in-person + online sessions",
      "Flexible week-to-week structure",
      "Stay accountable between sessions",
    ],
    accent: "amber",
    icon: "blend",
  },
];

// ---- What Ashley's coaching is built on ------------------------------------
export const values: { title: string; body: string; icon: 'target' | 'medal' | 'check' | 'heart' }[] = [
  {
    title: "Built Around You",
    body: "No two people get the same plan. Your program is shaped by your goals, your experience, and how your body actually moves.",
    icon: "target",
  },
  {
    title: "Real Experience",
    body: "Eight years of coaching real people through real progress — beginners finding their footing to seasoned lifters chasing new goals.",
    icon: "medal",
  },
  {
    title: "Form First",
    body: "Strength that lasts starts with moving well. We dial in technique so every rep counts and you train without breaking down.",
    icon: "check",
  },
  {
    title: "In It With You",
    body: "Coaching is a relationship. Whether we're in the gym or you're logging sessions from the road, I'm invested in your goals.",
    icon: "heart",
  },
];

// ---- Quick proof points for the hero band ----------------------------------
// Only claims we can stand behind — no invented client counts.
export const stats: { value: string; label: string }[] = [
  { value: "8+", label: "Years coaching" },
  { value: "1:1", label: "Every program personal" },
  { value: "2", label: "Ways to train — in person or online" },
];

// ---- Testimonials -----------------------------------------------------------
// PLACEHOLDERS. Ashley has clients lined up to provide real, honest testimonials;
// these stand-ins are clearly tagged and get swapped the moment hers arrive.
export type Testimonial = {
  quote: string;
  name: string;
  detail: string;
  placeholder: boolean;
};

export const testimonials: Testimonial[] = [
  {
    quote:
      "Ashley met me where I was and built a plan I could actually stick to. A year in, I'm lifting things I never thought I could.",
    name: "Client testimonial",
    detail: "Real client story coming soon",
    placeholder: true,
  },
  {
    quote:
      "I travel constantly for work, so her online programming has been a game-changer — my workouts follow me anywhere and I still hit my goals.",
    name: "Client testimonial",
    detail: "Real client story coming soon",
    placeholder: true,
  },
  {
    quote:
      "She actually watches your form and pushes you the right amount. I've never felt stronger or more confident in the gym.",
    name: "Client testimonial",
    detail: "Real client story coming soon",
    placeholder: true,
  },
];

// Convenience for links used across nav + footer.
export const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;
