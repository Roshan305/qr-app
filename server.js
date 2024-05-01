const express = require("express");
const { Pool } = require("pg");
const QRCode = require("qr-image");
const fs = require("fs");

const app = express();
const port = 3000;

// PostgreSQL configuration
const pool = new Pool({
  user: "qr",
  host: "localhost",
  database: "qr",
  password: "User@123$.",
  port: 5432,
});

// Endpoint to generate and save QR code
app.get("/generate-qr/:unique_id", async (req, res) => {
  const { unique_id } = req.params;
  console.log("Unique ID:", unique_id);

  // Generate QR code
  const qr_png = QRCode.image(unique_id, { type: "png" }); // Fixed here
  qr_png.pipe(fs.createWriteStream(`./qrcodes/${unique_id}.png`));

  // Save QR code details to database
  try {
    const query =
      "INSERT INTO qr_codes (unique_id, status) VALUES ($1, $2) RETURNING *";
    const values = [unique_id, "active"];
    const result = await pool.query(query, values);
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error generating QR code:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/", (req, res) => {
  res.send(
    "Welcome to the QR code generator. To generate a QR code, use the /generate-qr/:unique_id endpoint."
  );
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
