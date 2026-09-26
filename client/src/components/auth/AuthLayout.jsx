import { Link } from 'react-router-dom';
import { Clock, ShieldCheck, Star, Phone, MapPin } from 'lucide-react';

// Shared split-screen shell for every auth page (login / register / password
// reset) so they look like one product: deep red brand panel on the left with
// gold accents, clean card on the right. Same idiom as the Navbar / Home hero.

const PROOF = [
  { icon: Clock, label: '24/7 airport runs' },
  { icon: ShieldCheck, label: 'Licensed & insured' },
  { icon: Star, label: '4.9 average rating' },
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
    <div className="min-h-[calc(100vh-4rem)] bg-paper">
      <div className="mx-auto grid max-w-6xl items-stretch gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-12 lg:py-16">
        {/* Brand panel */}
        <aside className="relative hidden overflow-hidden rounded-3xl bg-brand-gradient p-10 text-white shadow-xl lg:flex lg:flex-col">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-1/4 h-64 w-64 rounded-full bg-gold-500/15 blur-3xl" />

          <div className="relative flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-lg font-bold text-brand-800 shadow-sm">
              E
            </span>
            <p className="font-display text-lg font-bold leading-none tracking-tight">
              Ellicott City <span className="text-gold-300">Airport Taxi</span>
            </p>
          </div>

          <div className="relative mt-12">
            {eyebrow && (
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-widest text-white/80 backdrop-blur">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold-400" />
                {eyebrow}
              </span>
            )}
            <h1 className="font-display mt-5 text-4xl font-bold leading-[1.1] tracking-tight">
              {title} {highlight && <span className="text-gold-300">{highlight}</span>}
            </h1>
            {subtitle && (
              <p className="mt-4 max-w-md text-sm leading-relaxed text-white/75">
                {subtitle}
              </p>
            )}
          </div>

          <ul className="relative mt-10 space-y-3">
            {PROOF.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-3 text-sm text-white/85">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-gold-300">
                  <Icon className="h-4 w-4" />
                </span>
                {label}
              </li>
            ))}
          </ul>

          <div className="relative mt-auto space-y-3 pt-12">
            <a
              href="tel:4103655556"
              className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur transition-colors hover:bg-white/15"
            >
              <Phone className="h-4 w-4 text-gold-300" />
              <span className="text-sm font-semibold text-white">(410) 365-5556</span>
              <span className="ml-auto text-xs text-white/60">24/7 dispatch</span>
            </a>
            <p className="flex items-center gap-2 text-xs text-white/55">
              <MapPin className="h-3.5 w-3.5" />
              Serving Maryland, DC &amp; Virginia
            </p>
          </div>
        </aside>

        {/* Form side */}
        <div className="flex flex-col justify-center">
          {/* Compact brand header for mobile */}
          <Link
            to="/"
            className="mb-6 inline-flex items-center gap-2 lg:hidden"
          >
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-gradient text-base font-bold text-white">
              E
            </span>
            <span className="font-display text-base font-bold tracking-tight">
              Ellicott City <span className="text-gold-600">Airport Taxi</span>
            </span>
          </Link>

          <div className="card p-6 sm:p-8">{children}</div>
          {footer && <div className="mt-6 text-center text-sm text-muted">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
