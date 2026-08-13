import dotenv from 'dotenv';

dotenv.config();

const GEOCODE_URL = 'https://nominatim.openstreetmap.org/search';

// Howard County, MD bounding box for bias: [minLon, minLat, maxLon, maxLat]
const DEFAULT_VIEWBOX = '-77.4,39.7,-76.4,38.7';

export const searchPlaces = async (query, { limit = 6, viewbox = DEFAULT_VIEWBOX } = {}) => {
  const url = new URL(GEOCODE_URL);
  url.searchParams.set('q', query);
  url.searchParams.set('format', 'json');
  url.searchParams.set('limit', String(limit));
  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('viewbox', viewbox);
  url.searchParams.set('bounded', '1');

  const res = await fetch(url, { headers: { 'User-Agent': 'RideTaxi/1.0' } });
  if (!res.ok) throw Object.assign(new Error('Place search failed'), { statusCode: 502 });
  const data = await res.json();

  return data.map((d) => ({
    id: d.place_id,
    address: d.display_name,
    lat: +d.lat,
    lng: +d.lon,
    type: d.type,
  }));
};