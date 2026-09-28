import json
import os
import tempfile
from bson import ObjectId
from database.database import (
    users_collection,
    documents_collection,
    quiz_attempts_collection
)
from datetime import datetime
from fastapi import UploadFile, File, HTTPException
from services.pdf_service import extract_text_from_pdf
from fastapi import FastAPI, HTTPException, Depends, UploadFile
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from auth.auth_service import verify_access_token
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from services.ai_service import (
    generate_ai_response,
    generate_flashcards,
    generate_quiz
)
from auth.auth_routes import router as auth_router

app = FastAPI()
security = HTTPBearer()
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials

    payload = verify_access_token(token)

    if not payload:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )

    return payload

app.include_router(auth_router)
class ChatRequest(BaseModel):
    message: str
    document_id: str | None = None 
    count: int = 3 # Optional field for document ID
class QuizSubmitRequest(BaseModel):
    document_id: str
    score: int
    total_questions: int
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "AI Learning Assistant Backend is running!"
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "message": "Backend is connected!"
    }

@app.post("/api/chat")
def chat(
    request: ChatRequest,
    current_user: dict = Depends(get_current_user)
):
    document_text = None

    if request.document_id:
        document_text = get_document_text(
            request.document_id,
            current_user["user_id"]
        )

        # Limit context size (characters)
        document_text = document_text[:12000]

    response = generate_ai_response(
        request.message,
        document_text
    )

    return {
        "reply": response,
        "user_id": current_user["user_id"]
    }

@app.post("/api/flashcards")
def create_flashcards(
    request: ChatRequest,
    current_user: dict = Depends(get_current_user)
):
    if not request.document_id:
        raise HTTPException(
            status_code=400,
            detail="Please select a PDF"
        )

    document_text = get_document_text(
        request.document_id,
        current_user["user_id"]
    )

    document_text = document_text[:12000]

    flashcards_text = generate_flashcards(document_text, request.count)

    import json

    flashcards = json.loads(flashcards_text)

    return {
        "success": True,
        "flashcards": flashcards["flashcards"]
    }

def get_document_text(
    document_id: str,
    user_id: str
) -> str:

    try:
        object_id = ObjectId(document_id)
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid document ID"
        )

    document = documents_collection.find_one({
        "_id": object_id,
        "user_id": user_id
    })

    if not document:
        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )

    return document["extracted_text"]

@app.post("/api/upload-pdf")
async def upload_pdf(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed"
        )

    temp_file_path = None

    try:
        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=".pdf"
        ) as temp_file:

            temp_file_path = temp_file.name
            file_content = await file.read()
            temp_file.write(file_content)

        extracted_text = extract_text_from_pdf(temp_file_path)

        if not extracted_text.strip():
            raise HTTPException(
                status_code=400,
                detail="Could not extract text from PDF"
            )
        document = {
            "user_id": current_user["user_id"],
            "filename": file.filename,
            "extracted_text": extracted_text,
            "text_length": len(extracted_text),
            "uploaded_at": datetime.utcnow()
        }

        documents_collection.insert_one(document)

        return {
            "success": True,
            "filename": file.filename,
            "text_length": len(extracted_text),
            "message": "PDF uploaded and text extracted successfully"
        }

    finally:
        if temp_file_path and os.path.exists(temp_file_path):
            os.remove(temp_file_path)

@app.get("/api/documents")
def get_user_documents(
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user["user_id"]

    documents = documents_collection.find(
        {"user_id": user_id},
        {
            "extracted_text": 0
        }
    )

    result = []

    for document in documents:
        result.append({
            "id": str(document["_id"]),
            "filename": document["filename"],
            "text_length": document["text_length"],
            "uploaded_at": document["uploaded_at"]
        })

    return {
        "success": True,
        "documents": result
    }

@app.delete("/api/documents/{document_id}")
def delete_document(
    document_id: str,
    current_user: dict = Depends(get_current_user)
):
    from bson import ObjectId

    user_id = current_user["user_id"]

    try:
        document = documents_collection.find_one({
            "_id": ObjectId(document_id),
            "user_id": user_id
        })
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid document ID"
        )

    if not document:
        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )

    documents_collection.delete_one({
        "_id": ObjectId(document_id),
        "user_id": user_id
    })

    return {
        "success": True,
        "message": "PDF deleted successfully"
    }

@app.post("/api/quiz")
def create_quiz(
    request: ChatRequest,
    current_user: dict = Depends(get_current_user)
):
    if not request.document_id:
        raise HTTPException(
            status_code=400,
            detail="Please select a PDF"
        )

    document_text = get_document_text(
        request.document_id,
        current_user["user_id"]
    )

    document_text = document_text[:12000]

    quiz_text = generate_quiz(document_text)

    import json

    quiz = json.loads(quiz_text)

    return {
        "success": True,
        "quiz": quiz["quiz"]
    }

@app.post("/api/quiz/submit")
def submit_quiz(
    request: QuizSubmitRequest,
    current_user: dict = Depends(get_current_user)
):
    quiz_attempt = {
        "user_id": current_user["user_id"],
        "document_id": request.document_id,
        "score": request.score,
        "total_questions": request.total_questions
    }

    result = quiz_attempts_collection.insert_one(quiz_attempt)

    return {
        "success": True,
        "message": "Quiz result saved successfully",
        "attempt_id": str(result.inserted_id)
    }

@app.get("/api/dashboard/stats")
def get_dashboard_stats(
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user["user_id"]

    total_documents = documents_collection.count_documents({
        "user_id": user_id
    })

    total_quizzes = quiz_attempts_collection.count_documents({
        "user_id": user_id
    })

    attempts = list(
        quiz_attempts_collection.find(
            {"user_id": user_id},
            {"score": 1, "total_questions": 1}
        )
    )

    total_score = 0
    total_questions = 0

    for attempt in attempts:
        total_score += attempt.get("score", 0)
        total_questions += attempt.get("total_questions", 0)

    average_score = (
        (total_score / total_questions) * 100
        if total_questions > 0
        else 0
    )

    return {
        "success": True,
        "total_documents": total_documents,
        "total_quizzes": total_quizzes,
        "average_score": round(average_score, 2)
    }

@app.get("/api/dashboard/quiz-history")
def get_quiz_history(
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user["user_id"]

    history = list(
        quiz_attempts_collection.find(
            {"user_id": user_id},
            {
                "_id": 0,
                "document_id": 1,
                "score": 1,
                "total_questions": 1
            }
        ).sort("_id", -1)
    )

    return {
        "success": True,
        "history": history
    }
