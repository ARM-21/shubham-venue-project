import session from "express-session";
import MongoStore from "connect-mongo";
import { ENV } from "./env.js";

export function sessionMiddleware() {
  return session({
    name: ENV.SESSION_NAME,
    secret: ENV.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,

    store: MongoStore.create({
      mongoUrl: ENV.MONGODB_URI,
      ttl: ENV.SESSION_TTL_SECONDS,
    }),

    cookie: {
      httpOnly: true,
      maxAge: ENV.SESSION_COOKIE_MAX_AGE_MS,
      secure: ENV.NODE_ENV === "production",
      sameSite: ENV.NODE_ENV === "production" ? "none" : "lax",
    },
  });
}