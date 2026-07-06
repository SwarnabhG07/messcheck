import os
import io
from celery import Celery
import camelot

celery_app = Celery(
    "tasks", broker="redis://redis:6379/0", backend="redis://redis:6379/0"
)


@celery_app.task
def process_pdf_task(file_path: str) -> dict:
    """Heavy CPU task running in a worker process."""
    try:
        tables = camelot.read_pdf(file_path, pages="all")

        if not tables or len(tables) == 0:
            return {"status": "FAILED", "error": "No tables found"}

        csv_buffer = io.StringIO()
        tables[0].df.to_csv(csv_buffer, index=False, header=False)

        return {"status": "COMPLETED", "csv_data": csv_buffer.getvalue()}

    except Exception as e:
        return {"status": "FAILED", "error": str(e)}

    finally:
        if os.path.exists(file_path):
            os.remove(file_path)
