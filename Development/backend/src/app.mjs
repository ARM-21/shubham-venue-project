import express from "express";
import cors from "cors";


const app = express();
const PORT = 4000;

app.use(cors({
    origin: "*",
}))

app.get("/", () => {
    console.log("server is running")
})
app.use("/api/account", )

app.listen(PORT, () => {
    console.log("server is running")
})