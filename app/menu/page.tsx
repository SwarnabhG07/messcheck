"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Loader2, Save } from "lucide-react";

export default function MenuManagerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"IDLE" | "UPLOADING" | "PROCESSING" | "COMPLETED" | "ERROR">("IDLE");
  const [error, setError] = useState("");
  const [tableData, setTableData] = useState<string[][]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setStatus("IDLE");
      setError("");
      setTableData([]);
    }
  };

  const parseCSV = (csvText: string) => {
    // Simple CSV parser that handles basic quotes and commas
    const rows = [];
    let currentRow = [];
    let currentCell = "";
    let inQuotes = false;
    
    for (let i = 0; i < csvText.length; i++) {
      const char = csvText[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        currentRow.push(currentCell.trim());
        currentCell = "";
      } else if (char === '\n' && !inQuotes) {
        currentRow.push(currentCell.trim());
        rows.push(currentRow);
        currentRow = [];
        currentCell = "";
      } else {
        currentCell += char;
      }
    }
    // Push the last cell/row if not empty
    if (currentCell || currentRow.length > 0) {
      currentRow.push(currentCell.trim());
      rows.push(currentRow);
    }
    return rows;
  };

  const handleUpload = async () => {
    if (!file) return;
    setStatus("UPLOADING");
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch("/api/ocr", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) throw new Error("Failed to upload file. Make sure Docker is running.");
      
      const { task_id } = await uploadRes.json();
      
      setStatus("PROCESSING");
      
      // Poll status
      const pollInterval = setInterval(async () => {
        try {
          const statusRes = await fetch(`/api/ocr?taskId=${task_id}&action=status`);
          const statusData = await statusRes.json();
          
          if (statusData.status === "COMPLETED") {
            clearInterval(pollInterval);
            
            // Fetch CSV
            const downloadRes = await fetch(`/api/ocr?taskId=${task_id}&action=download`);
            const csvText = await downloadRes.text();
            
            setTableData(parseCSV(csvText));
            setStatus("COMPLETED");
          } else if (statusData.status === "FAILED") {
            clearInterval(pollInterval);
            setStatus("ERROR");
            setError(statusData.error || "OCR Processing failed");
          }
        } catch (err) {
          clearInterval(pollInterval);
          setStatus("ERROR");
          setError("Error polling status");
        }
      }, 2000);
      
    } catch (err: any) {
      setStatus("ERROR");
      setError(err.message);
    }
  };

  const updateCell = (rowIndex: number, colIndex: number, value: string) => {
    const newData = [...tableData];
    newData[rowIndex][colIndex] = value;
    setTableData(newData);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-2">
          <Upload className="w-8 h-8 text-blue-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Upload Mess Menu PDF</h2>
        <p className="text-sm text-gray-500 max-w-md">
          Upload the PDF version of your mess menu. Our AI will automatically extract the tables so you can edit and publish them.
        </p>
        
        <input 
          type="file" 
          accept="application/pdf" 
          className="hidden" 
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={() => fileInputRef.current?.click()}
            className="font-medium"
          >
            Select PDF
          </Button>
          <Button 
            onClick={handleUpload}
            disabled={!file || status === "UPLOADING" || status === "PROCESSING"}
            className="bg-black text-white hover:bg-gray-900 font-medium min-w-[160px]"
          >
            {status === "UPLOADING" && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {status === "PROCESSING" && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {status === "IDLE" || status === "COMPLETED" || status === "ERROR" ? "Start Extraction" : 
             status === "UPLOADING" ? "Uploading..." : "Extracting Tables..."}
          </Button>
        </div>

        {file && (
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg mt-2">
            <FileText className="w-4 h-4 text-gray-400" />
            {file.name}
          </div>
        )}

        {error && (
          <div className="text-red-500 text-sm font-medium bg-red-50 px-4 py-2 rounded-lg mt-2 border border-red-100">
            {error}
          </div>
        )}
      </div>

      {tableData.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-bold text-gray-800">Extracted Menu Data</h3>
            <Button className="bg-green-600 hover:bg-green-700 text-white font-medium h-9 text-sm">
              <Save className="w-4 h-4 mr-2" />
              Save Menu
            </Button>
          </div>
          <div className="overflow-x-auto p-4 max-h-[600px] overflow-y-auto">
            <table className="w-full border-collapse min-w-max">
              <tbody>
                {tableData.map((row, rowIndex) => (
                  <tr key={rowIndex} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
                    {row.map((cell, colIndex) => (
                      <td key={colIndex} className="p-1 border border-gray-100 min-w-[120px]">
                        <input
                          type="text"
                          value={cell}
                          onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                          className="w-full h-full px-2 py-2 text-sm bg-transparent border-transparent focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded outline-none text-gray-700 font-medium transition-all"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
