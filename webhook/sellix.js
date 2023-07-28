// Require express and body-parser
const express = require("express");
const bodyParser = require("body-parser");
// Initialize express and define a port
const app = express();
const PORT = 3000;
// Tell express to use body-parser's JSON parsing
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
// Start express on the defined port
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

// Create a POST route
app.post("/webhook", (req, res) => {
  // Log the request body
  console.log(req.body);
  // Respond with a 200 OK
  res.status(200).end();
});

// Create a GET route
app.get("/webhook", (req, res) => {
  // Respond with a 200 OK
  console.log(req.body);
  res.status(200).end();
});
