import { useEffect, useState, useRef } from 'react';
import useGeolocation from '../../hooks/useGeolocation.js';
import { updateLocation, setAvailability, driverStats } from '../../services/rideService.js';
import { emitDriverLocation } from '../../services/socketService.js';
import { Button } from '../../components/ui/Button.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';

export default function Dashboard() {
  const { position } = useGeolocation();
  const [online, setOnline] = useState(false);
  const [stats, setStats] = useState(null);
  const lastSent = useRef(0);

  useEffect(() => {
    if (!online || !position) return;

    const tick = () => {
      const now = Date.now();
      if (now - lastSent.current < 2000) return; // throttle to 1 per 2s
      lastSent.current = now;
      updateLocation({
        lat: position.lat,
        lng: position.lng,
        heading: 0,
        speed: 0,
      }).catch(() => {});
      emitDriverLocation(position.lat, position.lng);
    };
    tick();
    const id = setInterval(tick, 2000);
    return () => clearInterval(id);
  }, [online, position]);

  const toggle = async () => {
    const next = !online;
    try {
      await setAvailability(next);
      setOnline(next);
    } catch {
      /* surface via UI */
    }
  };

  useEffect(() => {
    driverStats()
      .then(({ data }) => setStats(data.stats))
      .catch(() => {});
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold">Driver dashboard</h1>
      <p className="mt-1 text-sm text-muted">
        Go online to receive ride requests. Your location is shared while online.
      </p>

      {/* Status card */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold">
              Status: {online ? 'On duty' : 'Off duty'}
            </p>
            <p className="text-sm text-muted">
              {online
                ? 'You are visible to nearby passengers'
                : 'Toggle on to start receiving requests'}
            </p>
          </div>
          <Button
            variant={online ? 'secondary' : 'primary'}
            onClick={toggle}
            className={online ? '!border-brand-500 !text-brand-600' : ''}
          >
            {online ? 'Go offline' : 'Go online'}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Total rides', value: stats?.totalRides ?? '–' },
          { label: 'Completed', value: stats?.completedRides ?? '–' },
          { label: 'Earnings', value: stats ? `$${stats.totalEarnings}` : '–' },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-muted">{s.label}</p>
            <p className="mt-1 text-3xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      {!stats && (
        <div className="mt-6 flex justify-center">
          <Spinner label="Loading stats…" />
        </div>
      )}
    </div>
  );
}