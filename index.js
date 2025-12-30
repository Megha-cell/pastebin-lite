import dotenv from "dotenv";

dotenv.config();
import express from "express";
import redis from "./redis.js";
import cors from "cors";
import healthRoutes from "./routes/health.js";
import pasteRoutes from "./routes/pasteRoutes.js"
import { viewPaste } from "./controllers/viewPaste.js";
const app = express();
const allowedOrigin = process.env.FRONTEND_URL || "*";
app.use(cors({
  origin: allowedOrigin,
  methods: ["GET", "POST"],
  
}));


app.use(express.json());

app.use("/api", healthRoutes);
app.use("/api/pastes", pasteRoutes);
app.get("/p/:id", viewPaste);
app.get("/", (req, res) => {
  res.send("Pastebin Lite API is running");
});

// export default app;

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
