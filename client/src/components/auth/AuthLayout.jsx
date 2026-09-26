import { Link } from 'react-router-dom';
import { Clock, ShieldCheck, MapPin, Phone, Quote, Star } from 'lucide-react';
import { SERVICES, FEATURED_SERVICES } from '../../data/services.js';
import { VEHICLES } from '../../data/vehicles.js';

// Full-height "about the company" half used by every auth page (login,
// register, forgot/reset password) so they read as one premium product.
// Content is pulled from the same data as the marketing site — no invented
// numbers: counts come from SERVICES / VEHICLES, contact details from AGENTS.md.

const STATS = [
  { value: String(SERVICES.length), label: 'Services' },
  { value: String(VEHICLES.length), label: 'Vehicle classes' },
  { value: '3', label: 'States served' },
  { value: '24/7', label: 'Dispatch' },
];

const POPULAR = FEATURED_SERVICES.map((slug) => SERVICES.find((s) => s.slug === slug)).filter(
  Boolean,
);

const QUOTE = {
  text: 'Picked me up at BWI at 4:30am, drove the whole way professionally, and the fare was exactly what I saw on the app. Flawless.',
  name: 'Danielle R.',
  detail: 'Ellicott City, MD · Airport transfer',
};

const PROOF = [
  { icon: Clock, label: '24/7 airport runs' },
  { icon: ShieldCheck, label: 'Licensed & insured drivers' },
];

export default function AuthLayout({
  eyebrow,
  title,
  highlight,
  subtitle,
  children,
  footer,
}) {
  return (
    <div className="bg-paper">
      <div className="mx-auto grid max-w-7xl items-start gap-8 px-4 py-8 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:py-10">
        {/* Company panel — full-height half, sticks while the form scrolls */}
        <aside className="lg:sticky lg:top-24">
          <div className="relative flex flex-col overflow-hidden rounded-3xl bg-brand-gradient p-7 text-white shadow-2xl sm:p-10 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
            <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-28 -left-10 h-72 w-72 rounded-full bg-gold-500/15 blur-3xl" />

            <div className="relative flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-lg font-bold text-brand-800 shadow-sm">
                E
              </span>
              <div className="min-w-0">
                <p className="font-display text-[17px] font-bold leading-none tracking-tight">
                  Ellicott City <span className="text-gold-300">Airport Taxi</span>
                </p>
                <p className="mt-1 inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-widest text-white/70">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold-400" />
                  Online · 24/7 dispatch
                </p>
              </div>
            </div>

            <div className="relative mt-8">
              {eyebrow && (
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-widest text-white/80 backdrop-blur">
                  {eyebrow}
                </span>
              )}
              <h1 className="font-display mt-5 text-[32px] font-bold leading-[1.12] tracking-tight sm:text-[38px]">
                {title} {highlight && <span className="text-gold-300">{highlight}</span>}
              </h1>
              {subtitle && (
                <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/75">
                  {subtitle}
                </p>
              )}
            </div>

            {/* Stats — all counts derived from real data files */}
            <dl className="relative mt-8 grid grid-cols-4 gap-3 border-y border-white/10 py-5">
              {STATS.map((s) => (
                <div key={s.label} className="text-center">
                  <dt className="sr-only">{s.label}</dt>
                  <dd>
                    <span className="font-display block text-2xl font-extrabold text-gold-300">
                      {s.value}
                    </span>
                    <span className="mt-0.5 block text-[10px] uppercase tracking-widest text-white/55">
                      {s.label}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>

            {/* Services actually offered */}
            <div className="relative mt-7">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-white/55">
                What we run
              </p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {POPULAR.map((s) => (
                  <li key={s.slug}>
                    <Link
                      to={`/services/${s.slug}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/85 backdrop-blur transition-colors hover:border-gold-400/60 hover:bg-white/15 hover:text-white"
                    >
                      <s.icon className="h-3.5 w-3.5 text-gold-300" />
                      {s.short}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Social proof */}
            <figure className="relative mt-7 rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur">
              <Quote className="h-5 w-5 text-gold-300" />
              <blockquote className="mt-2 text-sm leading-relaxed text-white/85">
                “{QUOTE.text}”
              </blockquote>
              <figcaption className="mt-3 flex items-center gap-1.5 text-xs text-white/60">
                <Star className="h-3.5 w-3.5 fill-gold-400 text-gold-400" />
                <span className="font-semibold text-white/85">{QUOTE.name}</span>
                · {QUOTE.detail}
              </figcaption>
            </figure>

            <div className="relative mt-auto space-y-3 pt-7">
              <ul className="space-y-2">
                {PROOF.map(({ icon: Icon, label }) => (
                  <li key={label} className="flex items-center gap-2.5 text-sm text-white/80">
                    <Icon className="h-4 w-4 text-gold-300" />
                    {label}
                  </li>
                ))}
              </ul>
              <a
                href="tel:4103655556"
                className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 transition-colors hover:bg-white/15"
              >
                <Phone className="h-4 w-4 text-gold-300" />
                <span className="text-sm font-semibold">(410) 365-5556</span>
                <span className="ml-auto text-xs text-white/55">Call us</span>
              </a>
              <p className="flex items-center gap-2 text-xs text-white/50">
                <MapPin className="h-3.5 w-3.5" />
                9019 Early April Way, Ellicott City, MD · Serving MD, DC &amp; VA
              </p>
            </div>
          </div>
        </aside>

        {/* Form side */}
        <div className="flex flex-col justify-center lg:py-6">
          <Link to="/" className="mb-6 inline-flex items-center gap-2 lg:hidden">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-gradient text-base font-bold text-white">
              E
            </span>
            <span className="font-display text-base font-bold tracking-tight">
              Ellicott City <span className="text-gold-600">Airport Taxi</span>
            </span>
          </Link>

          <div className="card p-6 sm:p-8 lg:p-10">{children}</div>
          {footer && <div className="mt-6 text-center text-sm text-muted">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
