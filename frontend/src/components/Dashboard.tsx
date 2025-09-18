import React, { useState } from "react";
import axios from "axios";
import {
  Upload,
  CheckCircle,
  ToggleLeft,
  ToggleRight,
  LogOut,
  User,
  X,
  FileText,
  Loader2,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { getPrediction, type PredictionResponse } from "../services/predictionService";

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [ocrText, setOcrText] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string>("");
  const [claimType, setClaimType] = useState("IFR");
  const [isMapToggled, setIsMapToggled] = useState(true);
  const [address, setAddress] = useState("");
  const [predictions, setPredictions] = useState<PredictionResponse | null>(null);
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Allowed file types
  const allowedTypes = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "application/pdf",
  ];

  // Sample data for the table
  const existingRecords = [
    {
      id: 1,
      pattaHolder: "Masum",
      village: "Ipamcan",
      claimType: "IFR",
      area: "232 ha",
      status: "Granted",
    },
    {
      id: 2,
      pattaHolder: "Poushali",
      village: "Balaghat",
      claimType: "CR",
      area: "180 ha",
      status: "Pending",
    },
    {
      id: 3,
      pattaHolder: "Samiran",
      village: "Seoni",
      claimType: "CFR",
      area: "450 ha",
      status: "Verified",
    },
    {
      id: 4,
      pattaHolder: "Tiasha",
      village: "Seoni",
      claimType: "CFR",
      area: "450 ha",
      status: "Verified",
    },
    {
      id: 5,
      pattaHolder: "Soudip",
      village: "Seoni",
      claimType: "CFR",
      area: "450 ha",
      status: "Verified",
    },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];

      if (!allowedTypes.includes(selectedFile.type)) {
        setMessage("❌ Only JPG, PNG, and PDF files are allowed.");
        setFile(null);
        return;
      }

      console.log("File selected:", selectedFile.name);
      setFile(selectedFile);
      setMessage("");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("⚠️ Please select a valid file first!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    setMessage("🔄 Processing OCR... Please wait.");

    try {
      console.log("Uploading file:", file.name, "Size:", file.size, "Type:", file.type);
      
      const res = await axios.post("http://localhost:5000/ocr", formData, {
        timeout: 30000, 
      });

      console.log("Upload response:", res.data);
      setMessage("✅ File uploaded and OCR completed!");
      setOcrText(res.data.extractedText);
    } catch (err: any) {
      console.error("Upload error details:", err);
      if (err.response) {
        console.error("Response status:", err.response.status);
        console.error("Response data:", err.response.data);
        setMessage(`❌ ${err.response.data?.error || "File upload or OCR failed."}`);
      } else if (err.request) {
        console.error("No response received:", err.request);
        setMessage("❌ No response from server. Check if backend is running.");
      } else {
        console.error("Request setup error:", err.message);
        setMessage("❌ Request failed. Please try again.");
      }
    } finally {
      setUploading(false);
    }
  };

  const handlePrediction = async () => {
    if (!address.trim()) {
      setMessage("⚠️ Please enter an address for prediction!");
      return;
    }

    setPredictionLoading(true);
    try {
      const result = await getPrediction(address);
      setPredictions(result);
      setMessage("✅ Prediction completed!");
    } catch (error) {
      console.error("Prediction error:", error);
      setMessage("❌ Prediction failed. Please try again.");
    } finally {
      setPredictionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-4xl font-bold text-gray-800">
              FRA Claims Portal
            </h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-gray-600">
                <User className="h-5 w-5" />
                <span className="font-medium">{user?.name}</span>
                <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full capitalize">
                  {user?.role}
                </span>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Action Buttons */}
        <div className="flex gap-3 mb-8">
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            Upload FRA Record
          </button>
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            New Claim Form
          </button>
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            Map & Claims Viewer
          </button>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Document Scanning */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Document Scanning
              </h2>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                <p className="text-gray-600 mb-4">Drag and drop or</p>

                {file ? (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-blue-500 mr-2" />
                      <span className="text-gray-700 font-medium">
                        {file.name}
                      </span>
                      <span className="ml-2 text-gray-500 text-sm">
                        ({(file.size / 1024).toFixed(2)} KB)
                      </span>
                    </div>
                    <button
                      onClick={() => setFile(null)}
                      className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50"
                      title="Remove file"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : null}

                <div className="flex items-center justify-center gap-4">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                    />
                    <span className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors inline-block">
                      {file ? "Change File" : "Select File"}
                    </span>
                  </label>

                  <button
                    onClick={handleUpload}
                    disabled={!file || uploading}
                    className={`bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                      !file || uploading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      "Upload & Extract"
                    )}
                  </button>
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-600">{message}</p>
            </div>

            {/* OCR Extracted Text */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                OCR Extracted Text
              </h2>
              <div className="bg-gray-50 rounded-lg p-4 min-h-[100px]">
                {uploading ? (
                  <div className="flex items-center justify-center gap-3 text-gray-600">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Processing document... Please wait.</span>
                  </div>
                ) : (
                  <pre className="text-gray-700 whitespace-pre-wrap break-words">
                    {ocrText ||
                      "📄 No text extracted yet. Upload a document to see results."}
                  </pre>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* New Claim Form */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                New Claim Form
              </h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Community Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter community name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Village / District
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter village/district"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Claim Type
                  </label>
                  <select
                    value={claimType}
                    onChange={(e) => setClaimType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="IFR">IFR</option>
                    <option value="CR">CR</option>
                    <option value="CFR">CFR</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Area (ha)
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter area"
                  />
                </div>
              </div>
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                Upload it
              </button>
            </div>

            {/* AI Recommendation */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                AI Recommendation
              </h2>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter Address for Prediction
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter address (e.g., MG Road, Bangalore, Karnataka, India)"
                  />
                  <button
                    onClick={handlePrediction}
                    disabled={predictionLoading}
                    className={`bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors ${
                      predictionLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {predictionLoading ? "Predicting..." : "Predict"}
                  </button>
                </div>
              </div>
              <div className="space-y-3">
                {predictions ? (
                  <>
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-green-800">
                        PM-Kisan Eligibility: {predictions.predicted_class_pmk === 1 ? "Eligible" : "Not Eligible"} 
                        ({(predictions.predicted_probability_pmk * 100).toFixed(1)}%)
                      </span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-green-800">
                        Priority for Jal Jeevan Mission: {predictions.predicted_class_pmjvm === 1 ? "High Priority" : "Low Priority"} 
                        ({(predictions.predicted_probability_pmjvm * 100).toFixed(1)}%)
                      </span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-yellow-500" />
                      <span className="text-yellow-800">
                        JJM Eligibility: {predictions.predicted_class_jjm === 1 ? "Eligible" : "Not Eligible"} 
                        ({(predictions.predicted_probability_jjm * 100).toFixed(1)}%)
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Enter an address above to get AI recommendations</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Full-width Map Viewer */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Map Viewer</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Comoto</span>
              <button
                onClick={() => setIsMapToggled(!isMapToggled)}
                className="flex items-center"
              >
                {isMapToggled ? (
                  <ToggleRight className="h-6 w-6 text-blue-500" />
                ) : (
                  <ToggleLeft className="h-6 w-6 text-gray-400" />
                )}
              </button>
              <span className="text-sm text-gray-600">doe</span>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-200 via-green-100 to-blue-200 rounded-lg h-48 relative">
            {/* Simulated map with claim boundary */}
            <div className="absolute inset-4 border-2 border-blue-500 rounded-lg bg-blue-100 bg-opacity-30"></div>
          </div>
          <div className="flex gap-4 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Claim Boundaries</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Agricultural Map</span>
            </div>
          </div>
        </div>

        {/* Records Table */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Patta Holder Name
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Village
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Claim Type
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Area
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {existingRecords.map((record) => (
                  <tr
                    key={record.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 text-gray-900">
                      {record.pattaHolder}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {record.village}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {record.claimType}
                    </td>
                    <td className="py-3 px-4 text-gray-600">{record.area}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          record.status === "Granted"
                            ? "bg-green-100 text-green-800"
                            : record.status === "Pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
