import ENV  from "./env.config.js";

export const corsOptions = {
  origin: ENV.FRONTEND_ORIGIN,
  credentials: true,
};