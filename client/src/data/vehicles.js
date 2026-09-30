import { Car, CarFront, Bus, Gem, School } from 'lucide-react';

// Fleet vehicle types shared across booking, tracking, history, and admin.
// Keep ids stable — they are stored on Ride/User and used for driver matching.
//
// These entries are ONLY the offline fallback behind `CatalogContext`: the live
// source of truth is the FleetVehicle collection an admin manages. They must
// therefore mirror FLEET_DEFAULTS in server/src/services/catalogService.js —
// `seats`, `bags`, `capacity` and `image` included.
//
// That mirroring used to be missing. The fallback used to hardcode `seats: 4`
// and `image: ''` for every class, so whenever the API was slow or down the
// Fleet page lost every vehicle photo and claimed a Van seated 4. A degraded
// page is acceptable; a degraded page that lies about the product is not.
export const VEHICLES = [
  { id: 'executive-sedan', label: 'Executive Sedan', desc: 'Up to 4 riders', capacity: '1–4 passengers', seats: 4, bags: 2, image: '/images/ececutive-sedan.png', icon: Car },
  { id: 'economy-sedan', label: 'Economy Sedan', desc: 'Up to 4 riders', capacity: '1–4 passengers', seats: 4, bags: 2, image: '/images/economy-sedan.png', icon: Car },
  { id: 'economy-suv', label: 'Economy SUV', desc: 'Up to 6 riders', capacity: '4–6 passengers', seats: 6, bags: 3, image: '/images/economy-suv.png', icon: CarFront },
  { id: 'premium-suv', label: 'Premium SUV', desc: 'Up to 6 riders', capacity: '4–6 passengers', seats: 6, bags: 3, image: '/images/premium-suv.png', icon: CarFront },
  { id: 'luxury-suv', label: 'Luxury SUV', desc: 'Up to 6 riders', capacity: '4–6 passengers', seats: 6, bags: 4, image: '/images/luxury-suv.png', icon: Gem },
  { id: 'van', label: 'Van', desc: 'Up to 14 riders', capacity: '10–14 passengers', seats: 14, bags: 8, image: '/images/Van.png', icon: Bus },
  { id: 'mini-coach', label: 'Mini-Coach', desc: 'Up to 32 riders', capacity: '25–32 passengers', seats: 32, bags: 16, image: '/images/mini-coach.png', icon: Bus },
  { id: 'school-bus', label: 'School Bus', desc: 'Up to 48 riders', capacity: '42–48 passengers', seats: 48, bags: 0, image: '/images/School-bus.png', icon: School },
  { id: 'motorcoach', label: 'Motorcoach', desc: 'Up to 56 riders', capacity: '50–56 passengers', seats: 56, bags: 30, image: '/images/Motorcoach.png', icon: Bus },
];

export const vehicleLabel = (id) =>
  VEHICLES.find((v) => v.id === id)?.label || (id || '').replace(/-/g, ' ');