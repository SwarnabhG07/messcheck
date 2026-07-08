import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as Blob | null;
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Forward to FastAPI
    const fastApiFormData = new FormData();
    fastApiFormData.append("file", file);

    const response = await fetch("http://localhost:8000/extract/", {
      method: "POST",
      body: fastApiFormData,
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("FastAPI Error:", errText);
      throw new Error(`FastAPI returned ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("OCR API POST error:", error);
    return NextResponse.json({ error: "Failed to upload to OCR service" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const taskId = searchParams.get("taskId");
    const action = searchParams.get("action"); // 'status' or 'download'

    if (!taskId) {
      return NextResponse.json({ error: "Missing taskId" }, { status: 400 });
    }

    if (action === "download") {
      const res = await fetch(`http://localhost:8000/download/${taskId}`);
      if (!res.ok) {
          const err = await res.text();
          throw new Error("Failed to download: " + err);
      }
      const csvText = await res.text();
      return new NextResponse(csvText, {
        headers: { "Content-Type": "text/csv" }
      });
    } else {
      const res = await fetch(`http://localhost:8000/status/${taskId}`);
      if (!res.ok) throw new Error("Failed to check status");
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error("OCR API GET error:", error);
    return NextResponse.json({ error: "Failed to communicate with OCR service" }, { status: 500 });
  }
}
