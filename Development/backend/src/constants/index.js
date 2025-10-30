import { configDotenv } from "dotenv";
import path from "path"

configDotenv({ path: path.join(import.meta.dirname, "/../../.env.local") })

export default {
    DATABASE_URL: process.env.MONGODB_URI,

}
