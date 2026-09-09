import { useDriverRides } from '../../hooks/useDriverQuery';
import { Card, CardTitle } from '../../components/ui/card';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Phone, MessageCircle, Navigation, MapPin } from 'lucide-react';
import { updateRideStatus } from '../../../../services/rideService.js';
import { useState } from 'react';

const driverIcon = L.divIcon({ className:'map-pin-driver', html:'<span>●</span>', iconSize:[30,30], iconAnchor:[15,28] });
const pickupIcon = L.divIcon({ className:'map-pin-start', html:'<span>●</span>', iconSize:[22,22] });

export default function CurrentRidePage() {
  const { data, refetch } = useDriverRides() as any;
  const active = (data?.rides ?? []).find((r:any)=> ['accepted','arriving','in_progress'].includes(r.status));
  const [busy, setBusy] = useState('');
  const go = async (status:string) => {
    if (!active) return; setBusy(status);
    try { await updateRideStatus(active._id, { status }); refetch(); } catch {} finally { setBusy(''); }
  };
  if (!active) return <Card><CardTitle>Current Ride</CardTitle><p className="mt-3 text-sm text-muted">No active ride — accept a request to see passenger, route, ETA and controls here. Map shows driver→passenger→dropoff with traffic.</p></Card>;
  const center:[number,number]=[active.pickup.lat, active.pickup.lng];
  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-bold dark:text-white">Current Ride <span className="ml-2 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 capitalize">{active.status.replace('_',' ')}</span></h1>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle>{active.passenger?.name} • {active.passenger?.phone}</CardTitle>
          <div className="mt-3 space-y-2 text-sm">
            <p className="flex gap-2"><MapPin className="h-4 w-4 text-brand-600" />Pickup: {active.pickup.address}</p>
            <p className="flex gap-2 text-muted"><MapPin className="h-4 w-4 text-accent-400" />Dropoff: {active.dropoff.address}</p>
            <p className="text-muted">{active.fare.distanceKm} km • {active.fare.durationMin} min • <span className="font-semibold text-brand-700">${active.fare.estimated.toFixed(2)}</span> • {active.payment?.method}</p>
            <p className="text-xs text-muted">Notes: {active.notes || '—'} • Flight: {active.flightNumber || '—'} • Terminal: {active.terminal || '—'}</p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <a href={`tel:${active.passenger?.phone}`} className="rounded-full bg-white border border-accent-200 px-4 py-2 text-sm font-semibold hover:bg-accent-50 dark:border-white/10"><Phone className="mr-1 inline h-3 w-3" />Call</a>
            <button className="rounded-full border border-accent-200 bg-white px-4 py-2 text-sm font-semibold dark:border-white/10"><MessageCircle className="mr-1 inline h-3 w-3" />Chat</button>
            <a href={`https://www.google.com/maps/dir/?api=1&destination=${active.pickup.lat},${active.pickup.lng}`} target="_blank" rel="noreferrer" className="rounded-full btn-brand-gradient px-4 py-2 text-sm font-semibold text-white"><Navigation className="mr-1 inline h-3 w-3" />Navigate</a>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-2">
            {[
              { label:'Arrived', status:'arriving' },
              { label:'Start Trip', status:'in_progress' },
              { label:'Complete', status:'completed' },
            ].map(b=> <button key={b.status} onClick={()=>go(b.status)} disabled={!!busy} className="rounded-full border border-accent-200 bg-white py-2.5 text-sm font-semibold hover:bg-accent-50 disabled:opacity-50 dark:border-white/10 dark:bg-transparent">{busy===b.status?'...':b.label}</button>)}
            <button className="rounded-full bg-accent-50 py-2.5 text-sm font-semibold text-muted hover:bg-accent-100 dark:bg-white/5">Cancel</button>
          </div>
        </Card>
        <div className="overflow-hidden rounded-3xl border border-accent-200 shadow-sm dark:border-white/10">
          <MapContainer center={center} zoom={12} style={{height:'420px', width:'100%'}}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={[active.pickup.lat, active.pickup.lng]} icon={pickupIcon}><Popup>Pickup</Popup></Marker>
            <Marker position={[active.dropoff.lat, active.dropoff.lng]} icon={driverIcon}><Popup>Dropoff</Popup></Marker>
            <Polyline positions={[[active.pickup.lat,active.pickup.lng],[active.dropoff.lat,active.dropoff.lng]] as any} pathOptions={{color:'#c62828', weight:5}} />
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
