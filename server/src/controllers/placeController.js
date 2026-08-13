import { asyncHandler } from '../middleware/error.js';
import * as placeService from '../services/placeService.js';

// GET /api/places/search?q=...
export const search = asyncHandler(async (req, res) => {
  const q = (req.query.q || '').trim();
  if (q.length < 2) return res.json({ places: [] });

  const places = await placeService.searchPlaces(q, {
    limit: Math.min(+req.query.limit || 6, 10),
  });
  res.json({ places });
});