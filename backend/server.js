import express from "express";
import multer from "multer";
import cors from "cors";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import axios from "axios";
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

// ------------------- LULC API Proxy -------------------
app.get("/api/lulc", async (req, res) => {
  try {
    const { distcode, statcode, year = '1112', token = '' } = req.query;
    
    if (!distcode && !statcode) {
      return res.status(400).json({ error: "Either district code or state code is required" });
    }
    
    console.log(`Proxying request to Bhuvan API with params:`, req.query);
    
    // Use the correct Bhuvan API URL as per documentation
    const apiUrl = 'https://bhuvan-app1.nrsc.gov.in/api/lulc/curljson.php';
    
    // Build query parameters
    const queryParams = new URLSearchParams();
    if (distcode) queryParams.append('distcode', distcode);
    if (statcode) queryParams.append('statcode', statcode);
    if (year) queryParams.append('year', year);
    if (token) queryParams.append('token', token);
    
    const fullUrl = `${apiUrl}?${queryParams.toString()}`;
    console.log(`Making request to: ${fullUrl}`);
    
    // Proxy the request to the Bhuvan API with correct headers
    const response = await axios.get(fullUrl, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': 'https://bhuvan-app1.nrsc.gov.in/',
        'Origin': 'https://bhuvan-app1.nrsc.gov.in'
      }
    });
    
    console.log('Bhuvan API response status:', response.status);
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching LULC data:", error.message);
    if (error.response) {
      console.error("API error details:", {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
    }
    
    res.status(500).json({ 
      error: "Failed to fetch LULC data", 
      message: error.message,
      details: error.response ? error.response.data : null
    });
  }
});

// ------------------- OpenStreetMap API Proxy -------------------
app.get("/api/osm/search", async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: "Query parameter 'q' is required" });
    }
    
    console.log(`Proxying request to OpenStreetMap API with query:`, q);
    
    const url = `https://nominatim.openstreetmap.org/search?format=geojson&polygon_geojson=1&q=${encodeURIComponent(q)}`;
    
    // Add a delay to respect OpenStreetMap's usage policy (max 1 request per second)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'FRAClaimsPortal/1.0',
        'Accept': 'application/json'
      }
    });
    
    console.log('OpenStreetMap API response status:', response.status);
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching OpenStreetMap data:", error.message);
    if (error.response) {
      console.error("API error details:", {
        status: error.response.status,
        statusText: error.response.statusText
      });
    }
    
    res.status(500).json({ 
      error: "Failed to fetch OpenStreetMap data", 
      message: error.message
    });
  }
});

// ------------------- Start Server -------------------
app.listen(5000, () => {
  console.log("🚀 Server running at http://localhost:5000");
});
