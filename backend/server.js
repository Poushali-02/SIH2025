import express from "express";
import multer from "multer";
import cors from "cors";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config({ path: '../.env' });

const app = express();
app.use(cors());

// ------------------- Storage Config -------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Save files in "uploads" folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// ------------------- File Filter -------------------
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "application/pdf"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("❌ Only JPG, PNG, and PDF files are allowed!"), false);
  }
};

// ------------------- Multer Config -------------------
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
});

// ------------------- Gemini Setup -------------------
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ------------------- OCR Route -------------------
app.post("/ocr", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded!" });
    }

    const filePath = req.file.path;
    const fileExt = path.extname(req.file.originalname).toLowerCase();

    // Select model (flash = faster for images, pro = better for PDFs/text)
    const model =
      fileExt === ".pdf"
        ? genAI.getGenerativeModel({ model: "gemini-1.5-pro" })
        : genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Convert file → Base64
    const fileData = fs.readFileSync(filePath).toString("base64");

    // Send to Gemini
    const result = await model.generateContent([
      {
        inlineData: {
          data: fileData,
          mimeType: fileExt === ".pdf" ? "application/pdf" : req.file.mimetype,
        },
      },
      { text: "Extract all readable text from this document or image." },
    ]);

    // Extract text safely
    const extractedText =
      result.response?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    res.json({
      message: "✅ Gemini OCR completed successfully",
      extractedText,
    });
  } catch (err) {
    console.error("OCR error:", err);
    res.status(500).json({ error: "OCR failed" });
  }
});

// ------------------- File Upload Route -------------------
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded!" });
  }
  res.json({ message: "✅ File uploaded successfully!", file: req.file });
});

// ------------------- Error Handling -------------------
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  } else if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
});

// ------------------- Start Server -------------------
app.listen(5000, () => {
  console.log("🚀 Server running at http://localhost:5000");
});
