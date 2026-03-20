import SystemConfig from "../models/SystemConfig.js";

const CACHE_TTL_MS = 30 * 1000;
let cache = { fetchedAt: 0, maintenanceMode: false };

async function getMaintenanceMode() {
  const now = Date.now();
  if (now - cache.fetchedAt < CACHE_TTL_MS) return cache.maintenanceMode;

  const cfg = await SystemConfig.findOne({ key: "default" }).lean();
  cache = {
    fetchedAt: now,
    maintenanceMode: !!cfg?.maintenanceMode,
  };
  return cache.maintenanceMode;
}

export async function maintenanceMiddleware(req, res, next) {
  try {
    const path = req.path || "";
    const url = req.originalUrl || "";

    const allowPrefixes = [
      "/admin",
      "/api/v1/admin",
      "/auth",
      "/api/v1/auth",
      "/_health",
      "/config",
      "/api/v1/config",
    ];

    const allow = allowPrefixes.some((p) => path.startsWith(p) || url.startsWith(p));
    if (allow || req.method === "OPTIONS") return next();

    const isMaintenance = await getMaintenanceMode();
    if (isMaintenance) {
      // Allow read-only traffic so users can browse, but block mutating actions
      if (!['GET', 'HEAD'].includes(req.method)) {
        return res.status(503).json({ message: "Maintenance mode is enabled. Please try again later." });
      }
    }
    return next();
  } catch (err) {
    return next(err);
  }
}

export function resetMaintenanceCache() {
  cache = { fetchedAt: 0, maintenanceMode: false };
}
