import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Polyline, AttributionControl } from 'react-leaflet';
import L from 'leaflet';
import { getRide, cancelRide, driverEta } from '../../services/rideService.js';
import { MapViewSelector, MAP_VIEWS } from '../../components/maps/MapViewSelector.jsx';
import { vehicleLabel } from '../../data/vehicles.js';
import {
  joinRideRoom,
  onDriverFound,
  onRideUpdate,
  onDriverLocation,
  offRideUpdate,
} from '../../services/socketService.js';
import { Button } from '../../components/ui/Button.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';

const driverIcon = L.divIcon({
  className: '',
  html: `<div class="map-pin map-pin-driver"><span>🚕</span></div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

const pickupIcon = L.divIcon({
  className: '',
  html: `<div class="map-pin-start"><span>●</span></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
  popupAnchor: [0, -14],
});

const STATUS_TEXT = {
  pending: 'Finding you a driver…',
  accepted: 'Driver on the way',
  arriving: 'Driver arriving',
  in_progress: 'On your way',
  completed: 'Trip completed',
  cancelled: 'Trip cancelled',
};

export default function RideTracking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ride, setRide] = useState(null);
  const [driverPos, setDriverPos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [eta, setEta] = useState(null);
  const [driverRoute, setDriverRoute] = useState([]);
  const [mapView, setMapView] = useState('streets');
  const timer = useRef(null);

  const stopPolling = () => {
    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
  };

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const { data } = await getRide(id);
        if (cancelled) return;
        setRide(data.ride);
        joinRideRoom(id);
        setLoading(false);

        if (['completed', 'cancelled'].includes(data.ride.status)) stopPolling();
        else timer.current = setInterval(load, 15000);
      } catch (err) {
        if (cancelled) return;
        setError(err.response?.data?.message || 'Could not load ride');
        setLoading(false);
      }
    };
    load();

    onDriverFound(({ ride: updatedRide }) => {
      setRide(updatedRide);
      setEta(null);
    });
    onRideUpdate(({ ride: updatedRide }) => setRide(updatedRide));
    onDriverLocation(({ driverId, lat, lng }) => {
      if (driverId === ride?.driver?._id) setDriverPos({ lat, lng });
    });

    return () => {
      cancelled = true;
      stopPolling();
      offRideUpdate();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (ride?.status === 'accepted' && ride?.driver) setDriverPos(null);
  }, [ride?.status, ride?.driver]);

  // When the driver is heading to pickup, show their live route + ETA
  useEffect(() => {
    if (ride?.status !== 'accepted' || !ride?.driver?._id) return;
    let cancelled = false;

    const loadEta = async () => {
      try {
        const { data } = await driverEta(ride.driver._id, {
          lat: ride.pickup.lat,
          lng: ride.pickup.lng,
        });
        if (cancelled) return;
        setEta(data.durationMin);
        setDriverRoute(data.route || []);
      } catch {
        if (!cancelled) setEta(null);
      }
    };
    loadEta();
    const t = setInterval(loadEta, 20000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [ride?.status, ride?.driver?._id, ride?.pickup?.lat, ride?.pickup?.lng]);

  const handleCancel = async () => {
    if (!window.confirm('Cancel this ride?')) return;
    try {
      await cancelRide(id, 'Cancelled by passenger');
      stopPolling();
      navigate('/rides/history');
    } catch {
      setError('Could not cancel ride');
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner label="Loading ride…" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="text-muted">{error}</p>
        <Button className="mt-4" onClick={() => navigate('/')}>Back home</Button>
      </div>
    );
  }

  const status = ride.status;
  const route = ride.route || [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Map */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-2">
          <div className="relative h-[480px]">
            <MapContainer
              center={driverPos ? [driverPos.lat, driverPos.lng] : [ride.pickup.lat, ride.pickup.lng]}
              zoom={14}
              className="h-full w-full"
              attributionControl={false}
            >
              <AttributionControl position="bottomleft" />
              <TileLayer
                url={(MAP_VIEWS.find((v) => v.id === mapView) || MAP_VIEWS[0]).url}
                attribution={(MAP_VIEWS.find((v) => v.id === mapView) || MAP_VIEWS[0]).attribution}
              />
              {ride.pickup && (
                <Marker position={[ride.pickup.lat, ride.pickup.lng]} icon={pickupIcon} />
              )}
              {driverPos && (
                <Marker position={[driverPos.lat, driverPos.lng]} icon={driverIcon} />
              )}
              {driverRoute.length > 0 && (
                <>
                  <Polyline
                    positions={driverRoute.map((p) => [p.lat, p.lng])}
                    pathOptions={{ color: '#ffffff', weight: 9, opacity: 0.7, lineCap: 'round', dashArray: '8 10' }}
                  />
                  <Polyline
                    positions={driverRoute.map((p) => [p.lat, p.lng])}
                    pathOptions={{ color: '#c62828', weight: 5, opacity: 0.9, lineCap: 'round', dashArray: '8 10' }}
                  />
                </>
              )}
              {driverRoute.length === 0 && route.length > 0 && (
                <>
                  <Polyline positions={route.map((p) => [p.lat, p.lng])} pathOptions={{ color: '#ffffff', weight: 9, opacity: 0.7, lineCap: 'round' }} />
                  <Polyline positions={route.map((p) => [p.lat, p.lng])} pathOptions={{ color: '#c62828', weight: 5, opacity: 0.9, lineCap: 'round' }} />
                </>
              )}
            </MapContainer>

            {/* Status badge */}
            <div className="absolute left-4 top-4 z-[1000] flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-sm font-semibold shadow-sm">
              {['arriving', 'in_progress'].includes(status) && (
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-500 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-brand-600" />
                </span>
              )}
              {STATUS_TEXT[status]}
            </div>

            <MapViewSelector view={mapView} onChange={setMapView} />
          </div>
        </div>

        {/* Details panel */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold">Trip details</h2>

            <div className="mt-4 space-y-4">
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span className="h-2.5 w-2.5 rounded-full bg-brand-600" />
                  <span className="my-1 w-px flex-1 bg-slate-200" />
                  <span className="h-2.5 w-2.5 rounded-full bg-red-600" />
                </div>
                <div className="space-y-6 text-sm">
                  <div>
                    <p className="font-medium text-ink">{ride.pickup.address}</p>
                    <p className="text-xs text-muted">Pickup</p>
                  </div>
                  <div>
                    <p className="font-medium text-ink">{ride.dropoff.address}</p>
                    <p className="text-xs text-muted">Dropoff</p>
                  </div>
                </div>
              </div>
            </div>

            <dl className="mt-6 space-y-2 border-t border-slate-100 pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Vehicle</dt>
                <dd className="font-medium">{vehicleLabel(ride.vehicleType)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Distance</dt>
                <dd className="font-medium">{ride.fare.distanceKm} km</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Est. duration</dt>
                <dd className="font-medium">{ride.fare.durationMin} min</dd>
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-2">
                <dt className="font-medium">Estimated fare</dt>
                <dd className="font-bold text-brand-700">
                  ${(ride.fare.estimated || 0).toFixed(2)}
                </dd>
              </div>
            </dl>
          </div>

          {['pending', 'accepted', 'arriving'].includes(status) && (
            <Button variant="danger" className="w-full" onClick={handleCancel}>
              Cancel ride
            </Button>
          )}

          {eta && status === 'accepted' && (
            <div className="rounded-2xl bg-brand-500/10 px-5 py-4 text-sm">
              <div className="flex items-center gap-2 font-semibold text-brand-600">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-500 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-500" />
                </span>
                Driver is on the way
              </div>
              <p className="mt-1 text-ink">
                Arriving in <span className="font-bold text-brand-700">~{eta} min</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}