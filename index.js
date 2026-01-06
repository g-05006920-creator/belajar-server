const express = require("express");
const { PDFDocument } = require("pdf-lib");

const app = express();
app.use(express.json({ limit: "20mb" })); // penting untuk PDF besar

// GET test
app.get("/", (req, res) => {
  res.send("Server hidup 🚀");
});

// POST /stamp untuk tampal tandatangan
app.post("/stamp", async (req, res) => {
  try {
    const { pdfUrl, sigUrl } = req.body;

    if (!pdfUrl || !sigUrl) {
      return res.status(400).send("Missing pdfUrl or sigUrl");
    }

    // Ambil PDF + tandatangan dari internet
    const pdfBytes = await (await fetch(pdfUrl)).arrayBuffer();
    const sigBytes = await (await fetch(sigUrl)).arrayBuffer();

    // Load PDF
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const sigImage = await pdfDoc.embedPng(sigBytes);

    // Tampal tandatangan di **halaman terakhir**
    const pages = pdfDoc.getPages();
    const lastPage = pages[pages.length - 1];
    lastPage.drawImage(sigImage, {
      x: 50,    // koordinat kiri bawah
      y: 50,
      width: 150,
      height: 75
    });

    // Simpan PDF baru
    const pdfBuffer = await pdfDoc.save();

    // Hantar balik PDF baru
    res.setHeader("Content-Type", "application/pdf");
    res.send(Buffer.from(pdfBuffer));

  } catch (err) {
    console.log(err);
    res.status(500).send(err.toString());
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port", PORT));
