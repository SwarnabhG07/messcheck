import os
import uuid
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import Response
from tasks import celery_app, process_pdf_task

app = FastAPI(title="Async PDF Extractor")
UPLOAD_DIR = "/tmp/pdf_uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@app.post("/extract/", status_code=202)
async def start_extraction(file: UploadFile = File(...)):
    """Accepts file, saves it to shared disk, and handsoff to Celery."""
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDFs allowed.")

    # Save to a shared storage/volume
    task_id = str(uuid.uuid4())
    saved_path = os.path.join(UPLOAD_DIR, f"{task_id}.pdf")

    content = await file.read()
    with open(saved_path, "wb") as f:
        f.write(content)

    process_pdf_task.apply_async(args=[saved_path], task_id=task_id)

    return {"task_id": task_id, "status": "PENDING", "poll_url": f"/status/{task_id}"}


@app.get("/status/{task_id}")
def get_task_status(task_id: str):
    """Check task execution progress or fetch result."""
    task_result = celery_app.AsyncResult(task_id)

    if task_result.status == "PENDING":
        return {"task_id": task_id, "status": "PROCESSING"}

    elif task_result.status == "SUCCESS":
        result_data = task_result.result
        if result_data.get("status") == "FAILED":
            return {
                "task_id": task_id,
                "status": "FAILED",
                "error": result_data.get("error"),
            }

        return {
            "task_id": task_id,
            "status": "COMPLETED",
            "download_url": f"/download/{task_id}",
        }

    return {"task_id": task_id, "status": task_result.status}


@app.get("/download/{task_id}")
def download_csv(task_id: str):
    """Serves the generated CSV data directly from Redis backend."""
    task_result = celery_app.AsyncResult(task_id)
    if task_result.status != "SUCCESS":
        raise HTTPException(status_code=400, detail="Task not ready or failed.")

    csv_text = task_result.result.get("csv_data")
    return Response(
        content=csv_text,
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename=extracted_{task_id}.csv"
        },
    )
