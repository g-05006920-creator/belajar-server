const express = require("express");
const { PDFDocument } = require("pdf-lib");

const app = express();
app.use(express.json({ limit: "20mb" })); // penting untuk PDF besar

// Endpoint GET untuk test server hidup
app.get("/", (req, res) => {
  res.send("Server hidup 🚀");
});

// Endpoint POST untuk terima PDF & tandatangan
app.post("/stamp", async (req, res) => {
  try {
    const { pdfUrl, sigUrl } = req.body;

    if (!pdfUrl || !sigUrl) {
      return res.status(400).send("Missing pdfUrl or sigUrl");
    }

    // Node 18+ sudah ada fetch global
    const pdfResponse = await fetch(pdfUrl);
    const pdfBytes = await pdfResponse.arrayBuffer();

    const sigResponse = await fetch(sigUrl);
    const sigBytes = await sigResponse.arrayBuffer();

    // Load PDF ke memory (belum tampal tandatangan)
    const pdfDoc = await PDFDocument.load(pdfBytes);

    // Simpan PDF asal semula → untuk test POST request
    const pdfBuffer = await pdfDoc.save();

    res.setHeader("Content-Type", "application/pdf");
    res.send(Buffer.from(pdfBuffer));

  } catch (err) {
    res.status(500).send(err.toString());
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port", PORT));
