"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Loader2, Save, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function MenuManagerPage() {
  const { data: session } = useSession();
  const actualUserRole = (session?.user as any)?.role;
  const userRole = actualUserRole === "supreme_leader" ? "mess_secretary" : actualUserRole;
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"IDLE" | "UPLOADING" | "PROCESSING" | "COMPLETED" | "ERROR">("IDLE");
  const [error, setError] = useState("");
  const [tableData, setTableData] = useState<string[][]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoadingMenu, setIsLoadingMenu] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    async function loadMenu() {
      try {
        const res = await fetch("/api/menu");
        if (res.ok) {
          const data = await res.json();
          if (data.tableData && data.tableData.length > 0) {
            setTableData(data.tableData);
          }
        }
      } catch (error) {
        console.error("Failed to load existing menu:", error);
      } finally {
        setIsLoadingMenu(false);
      }
    }
    loadMenu();
  }, []);

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

      if (!uploadRes.ok) {
        let errorMessage = `Upload failed with status ${uploadRes.status}`;
        const errorText = await uploadRes.text();
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.error) {
            errorMessage = errorData.error;
          } else {
            errorMessage = `${errorMessage}: ${errorText}`;
          }
        } catch (e) {
          if (errorText) errorMessage = `${errorMessage}: ${errorText}`;
        }
        throw new Error(errorMessage);
      }
      
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
            setHasChanges(true);
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
    setHasChanges(true);
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSaveMenu = async () => {
    setIsSaving(true);
    setError("");
    try {
      const res = await fetch("/api/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tableData }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save menu");
      }
      alert("Menu saved successfully!");
      setHasChanges(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteMenu = async () => {
    setIsDeleting(true);
    setError("");
    try {
      const res = await fetch("/api/menu", { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete menu");
      }
      setTableData([]);
      setFile(null);
      setHasChanges(false);
      setStatus("IDLE");
      alert("Menu deleted successfully!");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <input 
        type="file" 
        accept="application/pdf" 
        className="hidden" 
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      
      {tableData.length === 0 && userRole !== "mess_secretary" && !isLoadingMenu && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center space-y-4 shrink-0">
          <FileText className="w-12 h-12 text-gray-300" />
          <h2 className="text-xl font-bold text-gray-900">No Menu Available</h2>
          <p className="text-sm text-gray-500 max-w-md">
            The mess menu has not been uploaded yet. Please ask your mess secretary to upload it.
          </p>
        </div>
      )}

      {tableData.length === 0 && userRole === "mess_secretary" && !isLoadingMenu && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center space-y-4 shrink-0">
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-2">
            <Upload className="w-8 h-8 text-amber-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Upload Mess Menu PDF</h2>
          <p className="text-sm text-gray-500 max-w-md">
            Upload the PDF version of your mess menu. Our AI will automatically extract the tables so you can edit and publish them.
          </p>
          
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
              className="bg-amber-600 text-white hover:bg-amber-700 font-medium min-w-[160px]"
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
      )}

      {isLoadingMenu ? (
        <div className="flex justify-center p-8 shrink-0">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : tableData.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-bold text-gray-800">Mess Menu</h3>
            <div className="flex items-center gap-3">
              {tableData.length > 0 && userRole === "mess_secretary" && (
                <Button 
                  variant="outline" 
                  onClick={() => fileInputRef.current?.click()}
                  className="font-medium h-9 text-sm text-gray-600 hover:text-gray-900 bg-white"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload PDF
                </Button>
              )}
              
              {userRole === "mess_secretary" && (
                <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="font-medium h-9 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-white rounded-xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your current mess menu for everyone in your hostel.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDeleteMenu}
                      className="bg-red-600 hover:bg-red-700 text-white rounded-lg"
                    >
                      {isDeleting ? "Deleting..." : "Delete Menu"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              )}
              
              {userRole === "mess_secretary" && (
                <Button 
                onClick={handleSaveMenu}
                disabled={isSaving || !hasChanges}
                className={`font-medium h-9 text-sm ${
                  (!hasChanges || isSaving)
                    ? "bg-gray-200 text-gray-500 hover:bg-gray-200"
                    : "bg-green-600 hover:bg-green-700 text-white"
                }`}
              >
                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                {isSaving ? "Saving..." : "Save Menu"}
              </Button>
              )}
            </div>
          </div>
          <div className="overflow-x-auto p-4 bg-white">
            <table className="w-full border-collapse min-w-max">
              <tbody>
                {tableData.map((row, rowIndex) => (
                  <tr key={rowIndex} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
                    {row.map((cell, colIndex) => (
                      <td key={colIndex} className="p-1 border border-gray-100 min-w-[120px]">
                        <textarea
                          value={cell}
                          readOnly={userRole !== "mess_secretary"}
                          onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                          className={`w-full min-h-[100px] px-2 py-2 text-sm bg-transparent border-transparent ${userRole === "mess_secretary" ? "focus:border-orange-500 focus:ring-1 focus:ring-orange-500" : ""} rounded outline-none text-gray-700 font-medium transition-all resize-y`}
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
