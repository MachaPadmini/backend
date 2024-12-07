const http = require("http");
const path = require("path");
const fs = require("fs");
const { MongoClient } = require("mongodb");

const uri =
  "mongodb+srv://machapdmn30798:padmini6899@eventsclusster.3voip.mongodb.net/?retryWrites=true&w=majority&appName=EventsClusster";
const client = new MongoClient(uri);

async function findsomedata(client, res) {
  const cursor = client.db("eventsdb").collection("eventscollection").find({});
  const results = await cursor.toArray();
  //console.log(results);
  //const js= (JSON.stringify(results));
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(results)); // Convert the array to JSON and send it
}

function getContentType(filePath) {
  const extname = path.extname(filePath).toLowerCase();
  switch (extname) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".gif":
      return "image/gif";
    case ".mp4":
      return "video/mp4";
    case ".mp3":
      return "audio/mpeg";
    case ".pdf":
      return "application/pdf";
    default:
      return "application/octet-stream";
  }
}

const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // Allow all origins
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.url === "/") {
    fs.readFile(
      path.join(__dirname, "public", "index.html"),
      (err, content) => {
        if (err) throw err;
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(content);
      }
    );
  } else if (req.url.startsWith("/media/")) {
    const filePath = path.join(__dirname, req.url);
    fs.stat(filePath, (err, stats) => {
      if (err || !stats.isFile()) {
        res.writeHead(404, { "Content-Type": "text/html" });
        res.end("<h1>404 - Media file not found</h1>");
        return;
      }
      const stream = fs.createReadStream(filePath);
      res.writeHead(200, { "Content-Type": getContentType(filePath) });
      stream.pipe(res);
    });
  } else if (req.url === "/api") {
    try {
      await client.connect();
      const data = await findsomedata(client, res);
    } catch (e) {
      console.error(e);
    } finally {
      await client.close();
    }
  } else {
    res.end("<h1> 404 nothing is here</h1>");
  }
});

const PORT = process.env.PORT || 5959;

server.listen(PORT, () =>
  console.log(`Great our server is running on port ${PORT} `)
);