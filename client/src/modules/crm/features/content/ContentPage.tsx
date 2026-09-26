import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import api from '../../../../services/api.js';
import { Card } from '../../components/ui/card';
import { useContent } from '../../../../context/ContentContext.jsx';

const input =
  'mt-1 w-full input-pill border px-3 py-2 text-sm dark:border-accent-700 dark:bg-accent-800';
const area =
  'mt-1 w-full rounded-2xl border px-3 py-2 text-sm dark:border-accent-700 dark:bg-accent-800';

function Field({
  label,
  value,
  onChange,
  hint,
  ...rest
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  [key: string]: any;
}) {
  return (
    <label className="text-sm">
      <span className="font-medium">{label}</span>
      {hint && <span className="block text-xs text-muted">{hint}</span>}
      <input value={value} onChange={(e) => onChange(e.target.value)} className={input} {...rest} />
    </label>
  );
}

function Area({
  label,
  value,
  onChange,
  rows = 3,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  hint?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="font-medium">{label}</span>
      {hint && <span className="block text-xs text-muted">{hint}</span>}
      <textarea rows={rows} value={value} onChange={(e) => onChange(e.target.value)} className={area} />
    </label>
  );
}

const lines = (v: string) =>
  v
    .split('\n')
    .map((x) => x.trim())
    .filter(Boolean);

export default function ContentPage() {
  const { refresh } = useContent();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'content'],
    queryFn: async () => (await api.get('/admin/content')).data,
  });
  const [c, setC] = useState<any>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (data?.content) setC(data.content);
  }, [data]);

  const save = useMutation({
    mutationFn: async () => (await api.patch('/admin/content', c)).data,
    onSuccess: async (res) => {
      setC(res.content);
      setSaved(true);
      await refresh();
      qc.invalidateQueries({ queryKey: ['admin', 'content'] });
    },
  });

  if (isLoading || !c) {
    return <div className="h-32 animate-pulse rounded-2xl bg-accent-200 dark:bg-accent-800" />;
  }

  const set = (k: string, v: any) => {
    setSaved(false);
    setC((p: any) => ({ ...p, [k]: v }));
  };
  const setRow = (k: string, i: number, f: string, v: string) => {
    setSaved(false);
    setC((p: any) => ({ ...p, [k]: (p[k] || []).map((r: any, n: number) => (n === i ? { ...r, [f]: v } : r)) }));
  };

  return (
    <div className="max-w-3xl space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Website Content</h1>
        <p className="text-sm text-muted">
          Live copy for the public site and the login / register panel. Saving publishes immediately.
        </p>
      </div>

      <Card>
        <h3 className="font-semibold">Home hero</h3>
        <div className="mt-3 space-y-3">
          <Field label="Eyebrow" value={c.heroEyebrow || ''} onChange={(v) => set('heroEyebrow', v)} />
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Title" value={c.heroTitle || ''} onChange={(v) => set('heroTitle', v)} />
            <Field
              label="Gold word"
              hint="Rendered in gold"
              value={c.heroHighlight || ''}
              onChange={(v) => set('heroHighlight', v)}
            />
            <Field label="Title tail" value={c.heroTitleTail || ''} onChange={(v) => set('heroTitleTail', v)} />
          </div>
          <Area label="Subtitle" value={c.heroSubtitle || ''} onChange={(v) => set('heroSubtitle', v)} />
          <Field label="Button label" value={c.heroCtaLabel || ''} onChange={(v) => set('heroCtaLabel', v)} />
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold">Contact details</h3>
        <p className="text-xs text-muted">Used site-wide: navbar, footer, contact page, auth panel and Careers.</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Field label="Phone (display)" value={c.contactPhone || ''} onChange={(v) => set('contactPhone', v)} />
          <Field
            label="Phone (tel: link)"
            hint="Digits only"
            value={c.contactPhoneHref || ''}
            onChange={(v) => set('contactPhoneHref', v.replace(/[^0-9+]/g, ''))}
            placeholder="4103655556"
          />
          <Field
            label="Email"
            type="email"
            value={c.contactEmail || ''}
            onChange={(v) => set('contactEmail', v)}
          />
          <Field label="Address" value={c.contactAddress || ''} onChange={(v) => set('contactAddress', v)} />
          <div className="sm:col-span-2">
            <Field label="Service area" value={c.serviceArea || ''} onChange={(v) => set('serviceArea', v)} />
          </div>
          <div className="sm:col-span-2">
            <Area label="Footer blurb" rows={2} value={c.tagline || ''} onChange={(v) => set('tagline', v)} />
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold">Home stat band</h3>
        <div className="mt-3 space-y-2">
          {(c.stats || []).map((r: any, i: number) => (
            <div key={i} className="grid gap-2 sm:grid-cols-[7rem_1fr]">
              <input
                value={r.value || ''}
                onChange={(e) => setRow('stats', i, 'value', e.target.value)}
                placeholder="24/7"
                className="input-pill border px-3 py-2 text-sm dark:border-accent-700 dark:bg-accent-800"
              />
              <input
                value={r.label || ''}
                onChange={(e) => setRow('stats', i, 'label', e.target.value)}
                placeholder="Service, every day"
                className="input-pill border px-3 py-2 text-sm dark:border-accent-700 dark:bg-accent-800"
              />
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold">Testimonials</h3>
        <p className="text-xs text-muted">Shown in order in the Home testimonials band.</p>
        <div className="mt-3 space-y-3">
          {(c.testimonials || []).map((r: any, i: number) => (
            <div key={i} className="space-y-2 rounded-2xl border border-accent-200 p-3 dark:border-accent-700">
              <textarea
                rows={2}
                value={r.quote || ''}
                onChange={(e) => setRow('testimonials', i, 'quote', e.target.value)}
                className="w-full rounded-xl border px-3 py-2 text-sm dark:border-accent-700 dark:bg-accent-800"
              />
              <div className="grid gap-2 sm:grid-cols-2">
                <input
                  value={r.name || ''}
                  onChange={(e) => setRow('testimonials', i, 'name', e.target.value)}
                  placeholder="Name"
                  className="input-pill border px-3 py-2 text-sm dark:border-accent-700 dark:bg-accent-800"
                />
                <input
                  value={r.detail || ''}
                  onChange={(e) => setRow('testimonials', i, 'detail', e.target.value)}
                  placeholder="City · Service"
                  className="input-pill border px-3 py-2 text-sm dark:border-accent-700 dark:bg-accent-800"
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold">Service areas</h3>
        <Area
          label="Comma-separated list"
          hint="Shown on the Home service-area band"
          value={(c.serviceAreas || []).join(', ')}
          onChange={(v) =>
            set(
              'serviceAreas',
              v
                .split(',')
                .map((x) => x.trim())
                .filter(Boolean),
            )
          }
        />
      </Card>

      <Card>
        <h3 className="font-semibold">Login / register panel</h3>
        <div className="mt-3 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              label="Headline"
              value={c.authHeadline?.title || ''}
              onChange={(v) => set('authHeadline', { ...c.authHeadline, title: v })}
            />
            <Field
              label="Gold word"
              value={c.authHeadline?.highlight || ''}
              onChange={(v) => set('authHeadline', { ...c.authHeadline, highlight: v })}
            />
          </div>
          <Area
            label="Proof points"
            hint="One per line"
            value={(c.authProof || []).join('\n')}
            onChange={(v) => set('authProof', lines(v))}
          />
        </div>
      </Card>

      <div className="flex items-center gap-3">
        <button
          onClick={() => save.mutate()}
          disabled={save.isPending}
          className="rounded-full btn-brand-gradient px-5 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {save.isPending ? 'Saving…' : 'Save website content'}
        </button>
        {saved && !save.isPending && <span className="text-sm text-success-600">Published</span>}
        {save.isError && <span className="text-sm text-brand-700">Could not save — check the fields and retry.</span>}
      </div>
    </div>
  );
}
