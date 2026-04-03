import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import cors from "cors";
import { connectDb } from "./config/db.js";
import dietRoutes from "./routes/paxsenixai.routes.js";
import path from "path";
//
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5001;

// middleware
app.use(express.json());
app.use(cors());
app.get("/health",(req,res)=>{
  res.send("health check")  
})
// routes
app.use("/api/auth", authRoutes);
app.use("/api/diet", dietRoutes);

//db connection
connectDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server Started running on PORT :${PORT}`);
  });
}).catch((err) => {
  console.error("Database connection failed:", err);
});
