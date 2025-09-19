# FRA Claims Portal

A comprehensive web application for managing Forest Rights Act (FRA) claims in India, combining document processing, AI-powered recommendations, and interactive geospatial mapping.

## 🚀 Features

- **Document Processing**: OCR text extraction from images and PDFs using Google Gemini AI
- **AI Recommendations**: ML-powered eligibility predictions for government schemes (PM-Kisan, JJM, PMJVM)
- **Interactive Mapping**: Leaflet-based map with Land Use Land Cover (LULC) visualization
- **Multi-role Authentication**: Support for ministry, district, forest, and NGO users
- **Claims Management**: Form submission and record tracking for FRA claims

## 🛠 Tech Stack

### Frontend
- **React 19** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Leaflet** for mapping

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose
- **Google Gemini AI** for OCR
- **Multer** for file uploads

### AI/ML Service
- **Python FastAPI** microservice
- **Scikit-learn** models for predictions
- **Geoapify** for geocoding

## 📁 Project Structure

```
sih2025/
├── backend/          # Node.js Express server
│   ├── models/       # MongoDB schemas
│   ├── server.js     # Main server file
│   └── uploads/      # File storage
├── frontend/         # React application
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── contexts/    # React contexts
│   │   ├── services/    # API services
│   │   └── types/       # TypeScript types
│   └── public/      # Static assets
└── Model/           # Python ML service
    ├── data.py      # FastAPI server
    └── *.pkl        # Trained ML models
```

## 🏃‍♂️ Quick Start

### Prerequisites
- Node.js 18+
- Python 3.8+
- MongoDB
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Poushali-02/SIH2025.git
   cd sih2025
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   # Configure .env file with required API keys
   npm start
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

4. **ML Service Setup** (Optional)
   ```bash
   cd ../Model
   pip install -r requirements.txt
   uvicorn data:app --reload
   ```

### Environment Variables

Create `.env` files in backend/ and Model/ directories:

**Backend (.env):**
```
GEMINI_API_KEY=your_gemini_api_key
MONGODB_URI=your_mongodb_connection_string
```

**ML Service (.env):**
```
GEOCODING_API=your_geoapify_api_key
```

## 🔧 Usage

1. **Authentication**: Login with appropriate role credentials
2. **Document Upload**: Upload FRA documents for OCR processing
3. **AI Predictions**: Enter addresses to get scheme eligibility predictions
4. **Map Visualization**: Select districts to view LULC data and claim boundaries
5. **Claims Management**: Submit and track FRA claim applications

## 📊 Key Endpoints

### Backend API
- `POST /ocr` - Document OCR processing
- `GET /api/lulc` - Land use land cover data
- `GET /api/osm/search` - OpenStreetMap geocoding

### ML Service
- `POST /predict` - AI scheme eligibility predictions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is part of SIH 2025 submission.
