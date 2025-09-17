import React, { useState } from "react";
import { Upload, CheckCircle, ToggleLeft, ToggleRight } from "lucide-react";

const App: React.FC = () => {
  const [ocrText, setOcrText] = useState<string>("");
  const [claimType, setClaimType] = useState("IFR");
  const [isMapToggled, setIsMapToggled] = useState(true);

  // Sample data for the table
  const existingRecords = [
    { id: 1, pattaHolder: "John Doe", village: "Ipamcan", claimType: "IFR", area: "232 ha", status: "Granted" },
    { id: 2, pattaHolder: "Jane Smith", village: "Balaghat", claimType: "CR", area: "180 ha", status: "Pending" },
    { id: 3, pattaHolder: "Ram Kumar", village: "Seoni", claimType: "CFR", area: "450 ha", status: "Verified" },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      // File handling logic will be implemented later
      console.log("File selected:", e.target.files[0].name);
      // Simulate OCR text extraction
      setOcrText("Sample extracted text from uploaded document...");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">FRA Claims Portal</h1>
        <div className="flex gap-3">
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
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Document Scanning */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Document Scanning</h2>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-3" />
              <p className="text-gray-600 mb-4">Drag and drop or</p>
              <label className="cursor-pointer">
                <input
                  type="file"
                  className="hidden"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                />
                <span className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors inline-block">
                  Upload File
                </span>
              </label>
            </div>
          </div>

          {/* OCR Extracted Text */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">OCR Extracted Text</h2>
            <div className="bg-gray-50 rounded-lg p-4 min-h-[100px]">
              <p className="text-gray-600">
                {ocrText || "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed diam nonummy nibh"}
              </p>
            </div>
          </div>

          {/* Map Viewer */}
          <div className="bg-white rounded-xl shadow-sm p-6">
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
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* New Claim Form */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">New Claim Form</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Community Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter community name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Village / District</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter village/district"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Claim Type</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Area (ha)</label>
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
            <h2 className="text-xl font-semibold text-gray-800 mb-4">AI Recommendation</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-green-800">Eligible for PM-Kisan</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-green-800">Priority for Jal Jeevan Mission</span>
              </div>
            </div>
          </div>

          {/* Old Records Login */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Old Records</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter password"
                />
              </div>
              <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-medium transition-colors">
                Log In
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Patta Holder Name</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Village</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Claim Type</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Area</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {existingRecords.map((record) => (
                <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-900">{record.pattaHolder}</td>
                  <td className="py-3 px-4 text-gray-600">{record.village}</td>
                  <td className="py-3 px-4 text-gray-600">{record.claimType}</td>
                  <td className="py-3 px-4 text-gray-600">{record.area}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      record.status === 'Granted' 
                        ? 'bg-green-100 text-green-800'
                        : record.status === 'Pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
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
  );
};

export default App;
