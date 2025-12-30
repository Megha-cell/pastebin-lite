import dotenv from "dotenv";

dotenv.config();
import express from "express";
import redis from "./redis.js";
import cors from "cors";
import healthRoutes from "./routes/health.js";
import pasteRoutes from "./routes/pasteRoutes.js"
import { viewPaste } from "./controllers/viewPaste.js";
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", healthRoutes);
app.use("/api/pastes", pasteRoutes);
app.get("/p/:id", viewPaste);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
