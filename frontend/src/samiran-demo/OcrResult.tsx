import React from "react";

interface OcrResultProps {
  text: string;
}

const OcrResult: React.FC<OcrResultProps> = ({ text }) => {
  if (!text) return null;

  return (
    <div style={{ marginTop: "20px", textAlign: "left" }} className="">
      <h3>📄 Extracted Text:</h3>
      <pre
        style={{
          background: "#f4f4f4",
          padding: "10px",
          borderRadius: "5px",
          whiteSpace: "pre-wrap",
          wordWrap: "break-word",
          color: "black",
        }}
        className="text-black"
      >
        {text}
      </pre>
    </div>
  );
};

export default OcrResult;
