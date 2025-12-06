import express from "express";
import cors from "cors";
import getDBConnection from "./connectDB.js";
import session from 'express-session';
import MongoStore from 'connect-mongo';


/**ROutes related imports */
import googleAuthRoutes from "./routers/auth/googleAuthRouter.js"
import authRoutes from "./routers/auth/authRouter.js"
import profileRoutes from "./routers/profileRouter.js"
import hallRoutes from "./routers/hallRouter.js"
const app = express();
const PORT = 4000;

await getDBConnection()
app.get("/_health", (req, res) => {
  return res.status(200).json({ ok: true, pid: process.pid });
});


app.use(cors({
    origin: "http://localhost:3000",
    credentials:true
}))
app.use(express.urlencoded({extended:true}))
app.use(express.json())



app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    ttl: 24 * 60 * 60 // Session TTL in seconds (1 day)
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // Cookie max age in milliseconds (1 day)
  }
}));

app.use("/api/v1/auth", authRoutes)
app.use("/api/v1/auth/google", googleAuthRoutes)
app.use("/api/v1/profile", profileRoutes)
app.use("/api/v1/halls", hallRoutes)

app.listen(PORT, () => {
    console.log("Server is running at PORT: "+ PORT)
})