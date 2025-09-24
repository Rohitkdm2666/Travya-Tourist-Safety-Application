import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";
import { getWeather } from "./controllers/apis.js";
import touristsRouter from "./routes/tourists.js";

const app = express();
dotenv.config();
app.use(cors());
app.use(express.json());




// Route to get weather + Gemini explanation
app.get("/weather/coords", getWeather);
app.use("/api/tourists", touristsRouter);

app.listen(5000, () => console.log("Server running on port 5000"));
