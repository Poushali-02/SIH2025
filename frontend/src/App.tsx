import React, { useState } from "react";
import FileUploads from "./samiran-demo/FileUploads";
import OcrResult from "./samiran-demo/OcrResult";

const App: React.FC = () => {

  const [ocrText, setOcrText] = useState<string>("");

  return (
    <div className="App">
      <FileUploads onOcrComplete={setOcrText} />
      <OcrResult text={ocrText} />
    </div>
  );
};

export default App;
