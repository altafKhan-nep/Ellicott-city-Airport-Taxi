import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents, AttributionControl } from 'react-leaflet';
import L from 'leaflet';
import { useMemo, useState } from 'react';
import { MapViewSelector, MAP_VIEWS } from './MapViewSelector.jsx';

const pickupIcon = L.divIcon({
  className: '',
  html: `<div class="map-pin-start"><span>●</span></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
  popupAnchor: [0, -14],
});

const dropoffIcon = L.divIcon({
  className: '',
  html: `<div class="map-pin map-pin-dropoff"><span>🏁</span></div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});

const driverIcon = L.divIcon({
  className: '',
  html: `<div class="map-pin map-pin-driver"><span>🚕</span></div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

const vehicleIcons = {
  sedan: L.divIcon({
    className: '',
    html: `<div class="map-pin map-pin-vehicle"><span>🚗</span></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
  }),
  suv: L.divIcon({
    className: '',
    html: `<div class="map-pin map-pin-vehicle"><span>🚙</span></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
  }),
  van: L.divIcon({
    className: '',
    html: `<div class="map-pin map-pin-vehicle"><span>🚐</span></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
  }),
};

// Captures map clicks and reports lat/lng
function ClickHandler({ onPick }) {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

export function BookingMap({ center, pickup, dropoff, route, drivers = [], onPick, interactive = true }) {
  const [view, setView] = useState('streets');
  const activeView = MAP_VIEWS.find((v) => v.id === view) || MAP_VIEWS[0];
  const routePositions = useMemo(
    () => (route?.length ? route.map((p) => [p.lat, p.lng]) : []),
    [route]
  );

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl">
      <MapContainer
        center={center || [39.203, -76.857]}
        zoom={13}
        className="h-full w-full"
        scrollWheelZoom
        attributionControl={false}
      >
        <AttributionControl position="bottomleft" />
        <TileLayer
          url={activeView.url}
          attribution={activeView.attribution}
          {...(activeView.subdomains ? { subdomains: activeView.subdomains } : {})}
        />
        {interactive && onPick && <ClickHandler onPick={onPick} />}

      {pickup?.lat != null && pickup?.lng != null && (
        <Marker position={[pickup.lat, pickup.lng]} icon={pickupIcon}>
          <Popup>Pickup</Popup>
        </Marker>
      )}
      {dropoff?.lat != null && dropoff?.lng != null && (
        <Marker position={[dropoff.lat, dropoff.lng]} icon={dropoffIcon}>
          <Popup>Dropoff</Popup>
        </Marker>
      )}

      {/* Nearby available drivers */}
      {drivers.map((d) =>
        d.lat != null && d.lng != null ? (
          <Marker
            key={d._id}
            position={[d.lat, d.lng]}
            icon={vehicleIcons[d.vehicleType] || driverIcon}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">{d.name}</p>
                <p className="text-xs capitalize text-muted">
                  {d.vehicleType} · {d.plateNumber}
                </p>
                <p className="mt-0.5 text-xs text-muted">Available now</p>
              </div>
            </Popup>
          </Marker>
        ) : null
      )}

      {routePositions.length > 0 && (
        <>
          <Polyline
            positions={routePositions}
            pathOptions={{ color: '#ffffff', weight: 9, opacity: 0.7, lineCap: 'round' }}
          />
          <Polyline
            positions={routePositions}
            pathOptions={{ color: '#c62828', weight: 5, opacity: 0.9, lineCap: 'round' }}
          />
        </>
      )}
      </MapContainer>

      <MapViewSelector view={view} onChange={setView} />
    </div>
  );
}