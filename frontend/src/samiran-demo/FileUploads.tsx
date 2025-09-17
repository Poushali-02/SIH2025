import React, { useState } from "react";
import type { ChangeEvent } from "react";
import axios from "axios";

interface FileUploadProps {
  onOcrComplete: (text: string) => void;
}

const FileUploads: React.FC<FileUploadProps> = ({ onOcrComplete }) => {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string>("");

  // Allowed file types
  const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "application/pdf"];

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];

      if (!allowedTypes.includes(selectedFile.type)) {
        setMessage("❌ Only JPG, PNG, and PDF files are allowed.");
        setFile(null);
        return;
      }

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

    try {
      const res = await axios.post("http://localhost:5000/ocr", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage("✅ File uploaded and OCR completed!");
      onOcrComplete(res.data.extractedText);
    } catch (err) {
      console.error(err);
      setMessage("❌ File upload or OCR failed.");
    }
  };

  return (
    <div className="" style={{ textAlign: "center", marginTop: "30px" }}>
      <h2>Upload File (Only JPG, PNG, PDF)</h2>

      <input className="border border-gray-300 rounded p-2 cursor-pointer" type="file" onChange={handleFileChange} accept="image/*,.pdf" />

      <button
        className="bg-blue-500 text-white rounded cursor-pointer"
        onClick={handleUpload}
        style={{ marginLeft: "10px", padding: "6px 12px" }}
      >
        Upload & Extract Text
      </button>

      <p>{message}</p>
    </div>
  );
};

export default FileUploads;
