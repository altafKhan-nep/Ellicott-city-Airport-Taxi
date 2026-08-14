// Fleet vehicle types shared across booking, tracking, history, and admin.
// Keep ids stable — they are stored on Ride/User and used for driver matching.
export const VEHICLES = [
  { id: 'executive-sedan', label: 'Executive Sedan', desc: 'Up to 4 riders', icon: '🚗' },
  { id: 'economy-sedan', label: 'Economy Sedan', desc: 'Up to 4 riders', icon: '🚘' },
  { id: 'economy-suv', label: 'Economy SUV', desc: 'Up to 6 riders', icon: '🚙' },
  { id: 'premium-suv', label: 'Premium SUV', desc: 'Up to 6 riders', icon: '🚙' },
  { id: 'luxury-suv', label: 'Luxury SUV', desc: 'Up to 7 riders', icon: '🚙' },
  { id: 'van', label: 'Van', desc: 'Up to 14 riders', icon: '🚐' },
  { id: 'mini-coach', label: 'Mini-Coach', desc: 'Up to 32 riders', icon: '🚌' },
  { id: 'school-bus', label: 'School Bus', desc: 'Up to 48 riders', icon: '🚌' },
  { id: 'motorcoach', label: 'Motorcoach', desc: 'Up to 56 riders', icon: '🚌' },
];

export const vehicleLabel = (id) =>
  VEHICLES.find((v) => v.id === id)?.label || (id || '').replace(/-/g, ' ');