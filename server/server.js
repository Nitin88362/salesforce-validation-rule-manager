const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend running successfully 🚀");
});

app.post("/deploy-rules", (req, res) => {
  const { rules } = req.body;

  console.log("Rules received from frontend:", rules);

  res.json({
    success: true,
    message: "Rules received successfully (Demo Deploy)",
  });
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});