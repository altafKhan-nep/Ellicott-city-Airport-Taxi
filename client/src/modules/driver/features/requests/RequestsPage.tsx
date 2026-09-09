import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, DollarSign, CreditCard, Car, Star, Navigation, Phone } from 'lucide-react';
import { Card, CardTitle } from '../../components/ui/card';
import { acceptRide } from '../../../../services/rideService.js';
import { onRideNew, offRideNew } from '../../../../services/socketService.js';
import { useDriverRides } from '../../hooks/useDriverQuery';

export default function RequestsPage() {
  const [live, setLive] = useState<any[]>([]);
  const { data } = useDriverRides() as any;
  const pending = (data?.rides ?? []).filter((r:any)=> r.status==='pending').slice(0,5);

  useEffect(()=> {
    onRideNew(({ ride }:any)=> setLive(prev=> prev.some(p=>p._id===ride._id) ? prev : [{...ride, _countdown:45}, ...prev].slice(0,5)));
    return ()=> offRideNew();
  }, []);

  const list = live.length ? live : pending;

  const accept = async (id:string) => {
    try { await acceptRide(id); setLive(prev=> prev.filter(p=>p._id!==id)); } catch {}
  };

  if (!list.length) return <Card><CardTitle>Live Ride Requests</CardTitle><p className="mt-4 text-sm text-muted">No requests right now — stay online, nearby airport/corporate rides appear here via Socket.IO with 45s countdown.</p><div className="mt-6 h-32 rounded-2xl border border-dashed border-accent-200 bg-accent-50 p-6 text-center dark:border-white/10 dark:bg-white/5"><p className="text-sm text-muted">Waiting for dispatch…</p></div></Card>;

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-bold dark:text-white">Live Ride Requests <span className="ml-2 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">{list.length} new</span></h1>
      <div className="grid gap-4 lg:grid-cols-2">
        {list.map((r:any)=> (
          <motion.div key={r._id} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}>
            <Card>
              <div className="flex items-start justify-between">
                <div><p className="font-display font-semibold">{r.passenger?.name || 'Passenger'} <span className="ml-1 inline-flex items-center gap-1 text-xs text-muted"><Star className="h-3 w-3 text-gold-400 fill-current" /> {r.passenger?.rating || '5.0'}</span></p><p className="text-xs text-muted">{r.serviceType || 'Airport'} • {r.vehicleType} • {r.passengerCount} pax</p></div>
                <span className="rounded-full bg-gold-50 px-2.5 py-1 text-xs font-bold text-gold-700 animate-pulse">{r._countdown ?? 45}s</span>
              </div>
              <div className="mt-3 space-y-1 text-sm">
                <p className="flex gap-2"><MapPin className="h-4 w-4 text-brand-600" />{r.pickup.address}</p>
                <p className="flex gap-2 text-muted"><MapPin className="h-4 w-4 text-accent-400" />{r.dropoff.address}</p>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-accent-50 px-2.5 py-1 dark:bg-white/5"><Clock className="mr-1 inline h-3 w-3" />{r.fare.distanceKm} km • {r.fare.durationMin} min</span>
                <span className="rounded-full bg-brand-50 px-2.5 py-1 font-semibold text-brand-700"><DollarSign className="mr-1 inline h-3 w-3" />${r.fare.estimated.toFixed(2)}</span>
                <span className="rounded-full bg-accent-50 px-2.5 py-1 dark:bg-white/5"><CreditCard className="mr-1 inline h-3 w-3" />{r.payment?.method || 'card'}</span>
                <span className="rounded-full bg-accent-50 px-2.5 py-1 dark:bg-white/5"><Car className="mr-1 inline h-3 w-3" />{r.vehicleType}</span>
              </div>
              <div className="mt-4 flex gap-2">
                <button onClick={()=>accept(r._id)} className="flex-1 rounded-full btn-brand-gradient py-2.5 text-sm font-semibold text-white">Accept Ride</button>
                <button className="rounded-full border border-accent-200 bg-white px-4 py-2.5 text-sm font-semibold hover:bg-accent-50 dark:border-white/10 dark:bg-transparent">Decline</button>
                <button className="grid h-10 w-10 place-items-center rounded-full border border-accent-200 dark:border-white/10"><Navigation className="h-4 w-4" /></button>
              </div>
              <p className="mt-2 text-xs text-muted">Pickup {r.fare.distanceKm} km away • Airport Terminal {r.flightNumber || '—'} • Notes: {r.notes || '—'}</p>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
