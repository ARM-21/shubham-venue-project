import express from "express";
import cors from "cors";
import getDBConnection from "./connectDB.js";
import session from 'express-session';
import MongoStore from 'connect-mongo';


/**ROutes related imports */
import authRoutes from "./routers/authRouter.js"
import profileRoutes from "./routers/profileRouter.js"
const app = express();
const PORT = 4000;

await getDBConnection()
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
app.use("/api/v1/profile", profileRoutes)

app.listen(PORT, () => {
    console.log("Server is running at PORT: "+ PORT)
})