import { Link } from 'react-router-dom';
import { Check, Phone, Star } from 'lucide-react';

// Full-height company panel shared by every auth page (login, register,
// forgot/reset password) so the whole auth family reads as one product.
// Style: minimal + editorial — wordmark, serif headline, proof lines, phone.
const PROOF = [
  'Licensed & insured chauffeurs',
  '24/7 dispatch, upfront flat fares',
  'Every airport · BWI, IAD, DCA',
];

export default function AuthLayout({ title, highlight, subtitle, children, footer }) {
  return (
    <div className="bg-paper">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:py-14">
        {/* Company half — full height, sticks while the form scrolls */}
        <aside className="lg:sticky lg:top-24">
          <div className="relative flex h-full min-h-[520px] flex-col justify-between overflow-hidden rounded-3xl bg-brand-gradient p-8 text-white shadow-2xl sm:p-10 lg:min-h-[calc(100vh-9rem)] lg:p-12">
            <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/5 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-gold-500/15 blur-3xl" />

            <div className="relative">
              <p className="font-display text-xl font-bold leading-none tracking-tight">
                Ellicott City <span className="text-gold-300">Airport Taxi</span>
              </p>
              <p className="mt-2.5 text-[11px] font-medium uppercase tracking-[0.2em] text-white/50">
                Ellicott City · Maryland
              </p>
            </div>

            <div className="relative my-10">
              <h1 className="font-display text-[34px] font-bold leading-[1.1] tracking-tight sm:text-[42px]">
                {title} {highlight && <span className="text-gold-300">{highlight}</span>}
              </h1>
              {subtitle && (
                <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-white/70">
                  {subtitle}
                </p>
              )}
            </div>

            <div className="relative space-y-5">
              <p className="inline-flex items-center gap-2 border-b border-white/10 pb-5 text-sm font-medium text-white/90">
                <Star className="h-4 w-4 fill-gold-400 text-gold-400" />
                Local Howard County company
              </p>

              <ul className="space-y-2.5">
                {PROOF.map((line) => (
                  <li key={line} className="flex items-center gap-3 text-sm text-white/75">
                    <Check className="h-4 w-4 shrink-0 text-gold-300" />
                    {line}
                  </li>
                ))}
              </ul>

              <a
                href="tel:4103655556"
                className="flex items-center gap-3 pt-2 transition-opacity hover:opacity-90"
              >
                <Phone className="h-5 w-5 text-gold-300" />
                <span className="font-display text-2xl font-bold tracking-tight">(410) 365-5556</span>
              </a>
            </div>
          </div>
        </aside>

        {/* Form half */}
        <div className="flex flex-col justify-center">
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
