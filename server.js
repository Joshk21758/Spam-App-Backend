import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import userRoutes from "./routes/userRoutes";
import dotenv from "dotenv";
dotenv.config();

//app setup
const app = express();
const PORT = process.env.PORT;
const DB_URI = process.env.MONGO_URI;

//middleware
app.use(express.json()); //parse JSON bodies
app.use(cors());

//database connection
mongoose
  .connect(DB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("Failed to connect to MongoDB", err));

//routes
app.get("/", (req, res) => {
  res.send("Welcome to secure gaurd backend!");
});

//User routes
app.use("/api/user", userRoutes);

//Listen
app.listen(PORT, () => {
  console.log(`Server running on port${PORT}`);
});
