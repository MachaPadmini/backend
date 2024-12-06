const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const path = require("path");
const fs = require("fs");
const serverless = require("serverless-http");

const app = express();
const port = 5000;

// Enable CORS
app.use(cors());

// MongoDB connection URI
const uri = "mongodb+srv://machapdmn30798:padmini6899@eventsclusster.3voip.mongodb.net/?retryWrites=true&w=majority&appName=EventsClusster";
const client = new MongoClient(uri);

// Connect to MongoDB
async function connectMongoDB() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1); // Exit process if MongoDB connection fails
  }
}

// Serve static HTML file
app.get("/", (req, res) => {
  const filePath = path.join(__dirname, "public", "index.html");
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading index.html:", err);
      return res.status(500).send("Failed to load the page");
    }
    res.send(data);
  });
});

// API route to fetch data from MongoDB
app.get("/api", async (req, res) => {
  try {
    const results = await client
      .db("eventsdb")
      .collection("eventscollection")
      .find({})
      .toArray();
    res.json(results);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Internal Server Error");
  }
});

const mediaFolder = path.join(__dirname, "media");

// API to serve individual media files
app.get("/media/:filename", (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(mediaFolder, filename);

  fs.access(filePath, fs.constants.F_OK, err => {
    if (err) {
      console.error("File not found:", filePath);
      return res.status(404).send("File not found");
    }

    res.sendFile(filePath); // Serve the file
  });
});

// Serverless handler export
module.exports.handler = serverless(app);

// Start server locally
if (require.main === module) {
  (async () => {
    await connectMongoDB();
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  })();
}
