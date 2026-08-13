import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listRides } from '../../services/rideService.js';
import { Spinner } from '../../components/ui/Spinner.jsx';

const STATUS_STYLE = {
  pending: 'bg-accent-50 text-accent-700',
  accepted: 'bg-blue-50 text-blue-700',
  arriving: 'bg-blue-50 text-blue-700',
  in_progress: 'bg-brand-50 text-brand-700',
  completed: 'bg-brand-50 text-brand-700',
  cancelled: 'bg-slate-100 text-slate-500',
};

export default function RideHistory() {
  const [rides, setRides] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    listRides()
      .then(({ data }) => setRides(data.rides))
      .catch(() => setError('Could not load ride history'));
  }, []);

  if (error) return <p className="px-4 py-16 text-center text-muted">{error}</p>;
  if (!rides)
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner label="Loading rides…" />
      </div>
    );

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold">Your rides</h1>
      <p className="mt-1 text-sm text-muted">Past and upcoming trips.</p>

      {rides.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="text-muted">No rides yet.</p>
          <Link
            to="/"
            className="mt-3 inline-block font-semibold text-brand-700 hover:underline"
          >
            Book your first ride
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {rides.map((r) => (
            <div
              key={r._id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${STATUS_STYLE[r.status]}`}>
                      {r.status.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-muted">
                      {new Date(r.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="mt-2 truncate text-sm font-medium">{r.pickup.address}</p>
                  <p className="truncate text-sm text-muted">→ {r.dropoff.address}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-brand-700">
                    ${(r.status === 'completed' ? r.fare.final : r.fare.estimated || 0).toFixed(2)}
                  </p>
                  <p className="text-xs text-muted capitalize">{r.vehicleType}</p>
                  {['pending', 'accepted', 'arriving', 'in_progress'].includes(r.status) && (
                    <Link
                      to={`/rides/track/${r._id}`}
                      className="mt-2 inline-block rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
                    >
                      Track
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}