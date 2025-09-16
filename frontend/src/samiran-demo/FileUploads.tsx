import React, { useState } from "react";
import type { ChangeEvent } from "react";
import axios from "axios";

const FileUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string>("");

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a file first!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post<{ message: string; filename: string }>(
        "http://localhost:5000/upload",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setMessage(`${res.data.message} (${res.data.filename})`);
    } catch (err) {
      setMessage("Error uploading file: " + (err as Error).message);
    }
  };

  return (
    <div className="p-4 border rounded shadow w-80 mx-auto text-center">
      <h2 className="text-lg font-bold mb-2">Upload File</h2>

      <input
        type="file"
        accept="image/*,.pdf"
        capture="environment"
        onChange={handleFileChange}
      />

      <button
        onClick={handleUpload}
        className="bg-blue-500 text-white px-4 py-2 mt-2 rounded"
      >
        Upload
      </button>

      {message && <p className="mt-2">{message}</p>}
    </div>
  );
};

export default FileUpload;
