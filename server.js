const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

//app setup
const app = express();
const PORT = process.env.PORT;

//middleware
app.use(express.json()); //parse JSON bodies
app.use(cors());

app.get("/", (req, res) => {
  res.send("Welcome to the Secure Guard API");
});

//Listen to app server
app.listen(PORT, () => {
  console.log(`Server running on port${PORT}`);
});
