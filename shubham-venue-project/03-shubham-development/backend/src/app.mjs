import express from "express";
import cors from "cors";

import getDBConnection from "./connectDB.js";
import apiRouter from "./routes/index.js";

import ENV ,{assertEnv } from "./config/env.config.js";
import { corsOptions } from "./config/cors.config.js";
import { sessionMiddleware } from "./config/session.config.js";
import errorMiddleware from "./middleware/error.middleware.js";
import { maintenanceMiddleware } from "./middleware/maintenance.middleware.js";

const app = express();

assertEnv();
await getDBConnection();



app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(sessionMiddleware());
app.use(maintenanceMiddleware);

app.get("/_health", (req, res) => {
  return res.status(200).json({ ok: true, pid: process.pid });
});

app.use("/api/v1", apiRouter);

app.use(errorMiddleware);

app.listen(ENV.PORT, () => {
  console.log("Server is running at PORT: " + ENV.PORT);
});