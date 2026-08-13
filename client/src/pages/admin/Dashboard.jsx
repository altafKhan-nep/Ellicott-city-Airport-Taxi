import { useEffect, useState } from 'react';
import {
  adminAnalytics,
  adminRides,
  adminDrivers,
} from '../../services/rideService.js';
import { Spinner } from '../../components/ui/Spinner.jsx';

const STATUS_STYLE = {
  pending: 'bg-accent-50 text-accent-700',
  accepted: 'bg-blue-50 text-blue-700',
  arriving: 'bg-blue-50 text-blue-700',
  in_progress: 'bg-brand-50 text-brand-700',
  completed: 'bg-brand-50 text-brand-700',
  cancelled: 'bg-slate-100 text-slate-500',
};

export default function Dashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [rides, setRides] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [active, setActive] = useState('overview');
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const [a, r, d] = await Promise.all([adminAnalytics(), adminRides(), adminDrivers()]);
      setAnalytics(a.data);
      setRides(r.data.rides);
      setDrivers(d.data.drivers);
    } catch {
      setError('Could not load CRM data');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'rides', label: 'Rides' },
    { id: 'drivers', label: 'Drivers' },
  ];

  if (error) return <p className="px-4 py-16 text-center text-muted">{error}</p>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">CRM dashboard</h1>
          <p className="mt-1 text-sm text-muted">Ops overview for {analytics?.totalRides ?? '…'} rides.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex gap-1 rounded-xl bg-slate-100 p-1 sm:inline-flex">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors sm:flex-none ${
              active === t.id ? 'bg-white text-ink shadow-sm' : 'text-muted'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {active === 'overview' && !analytics && (
        <div className="mt-8 flex justify-center">
          <Spinner label="Loading analytics…" />
        </div>
      )}

      {active === 'overview' && analytics && (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {[
              { label: 'Total rides', value: analytics.totalRides },
              { label: 'Active now', value: analytics.activeRides },
              { label: 'Drivers', value: analytics.totalDrivers },
              { label: 'Passengers', value: analytics.totalPassengers },
              { label: 'Revenue', value: `$${analytics.revenue}` },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-muted">{s.label}</p>
                <p className="mt-1 text-2xl font-bold">{s.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-bold">Recent rides</h2>
            <ul className="mt-4 space-y-3 text-sm">
              {analytics.recentRides.slice(0, 5).map((r) => (
                <li key={r._id} className="flex items-center justify-between border-b border-slate-50 pb-3 last:border-0">
                  <span>
                    {r.passenger?.name || 'Unknown'} → {r.pickup.address}
                  </span>
                  <span className="text-xs text-muted">{new Date(r.createdAt).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      {active === 'rides' && (
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Passenger</th>
                  <th className="px-4 py-3">Pickup</th>
                  <th className="px-4 py-3">Dropoff</th>
                  <th className="px-4 py-3">Fare</th>
                  <th className="px-4 py-3">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rides.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${STATUS_STYLE[r.status]}`}>
                        {r.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">{r.passenger?.name || '—'}</td>
                    <td className="max-w-[160px] truncate px-4 py-3 text-muted">{r.pickup.address}</td>
                    <td className="max-w-[160px] truncate px-4 py-3 text-muted">{r.dropoff.address}</td>
                    <td className="px-4 py-3 font-medium">
                      ${(r.status === 'completed' ? r.fare.final : r.fare.estimated).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {active === 'drivers' && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {drivers.map((d) => (
            <div key={d._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-full bg-brand-50 text-sm font-bold text-brand-700">
                  {d.name?.[0]}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold">{d.name}</p>
                  <p className="truncate text-xs text-muted">{d.email}</p>
                </div>
                <span
                  className={`ml-auto rounded-full px-2.5 py-1 text-xs font-medium ${
                    d.driverDetails?.isAvailable
                      ? 'bg-brand-50 text-brand-700'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {d.driverDetails?.isAvailable ? 'Online' : 'Offline'}
                </span>
              </div>
              <p className="mt-3 text-xs text-muted">
                {d.driverDetails?.vehicleType} · {d.driverDetails?.plateNumber || 'No plate'}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}