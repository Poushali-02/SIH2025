import React, { useState } from "react";
import type { ChangeEvent } from "react";
import axios from "axios";

const FileUpload: React.FC = () => {
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
      const res = await axios.post("http://localhost:5000/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage("✅ File uploaded successfully!");
    } catch (err) {
      console.error(err);
      setMessage("❌ File upload failed.");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Upload File (Only JPG, PNG, PDF)</h2>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
      <p>{message}</p>
    </div>
  );
};

export default FileUpload;