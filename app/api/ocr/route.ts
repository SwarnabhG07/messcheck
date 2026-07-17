import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Forward to FastAPI
    const fastApiFormData = new FormData();
    fastApiFormData.append("file", file, file.name);

    const baseUrl = process.env.FASTAPI_HOST;
    if (!baseUrl) {
      return NextResponse.json({ error: "OCR service is not configured (missing FASTAPI_HOST)" }, { status: 500 });
    }
    const response = await fetch(`${baseUrl}/extract/`, {
      method: "POST",
      body: fastApiFormData,
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("FastAPI Error:", errText);
      return NextResponse.json(
        { error: "An error occurred while communicating with the OCR service" },
        { status: response.status === 413 ? 413 : response.status } // In case of size limit or other
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("OCR API POST error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
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
      const baseUrl = process.env.FASTAPI_HOST;
      if (!baseUrl) throw new Error("OCR service is not configured");
      const res = await fetch(`${baseUrl}/download/${taskId}`);
      if (!res.ok) {
          const err = await res.text();
          console.error("Failed to download OCR CSV:", err);
          throw new Error("Failed to download document");
      }
      const csvText = await res.text();
      return new NextResponse(csvText, {
        headers: { "Content-Type": "text/csv" }
      });
    } else {
      const baseUrl = process.env.FASTAPI_HOST;
      if (!baseUrl) throw new Error("OCR service is not configured");
      const res = await fetch(`${baseUrl}/status/${taskId}`);
      if (!res.ok) throw new Error("Failed to check status");
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error("OCR API GET error:", error);
    return NextResponse.json({ error: "Failed to communicate with OCR service" }, { status: 500 });
  }
}
