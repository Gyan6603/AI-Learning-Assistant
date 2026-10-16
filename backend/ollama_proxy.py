
import os
from pathlib import Path

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, Header, HTTPException, Request
from fastapi.responses import Response

ENV_PATH = Path(__file__).with_name(".env")
load_dotenv(ENV_PATH, override=True)

PROXY_TOKEN = (os.getenv("OLLAMA_PROXY_TOKEN") or "").strip()
app = FastAPI(title="Secure Ollama Proxy")

OLLAMA_URL = "http://127.0.0.1:11434"

ALLOWED_PATHS = {"/api/chat", "/api/generate", "/api/tags"}


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.api_route("/{path:path}", methods=["GET", "POST"])
async def proxy(
    path: str,
    request: Request,
    authorization: str | None = Header(default=None),
):
    if not PROXY_TOKEN:
        raise HTTPException(status_code=503, detail="Proxy token is not configured")

    expected = f"Bearer {PROXY_TOKEN}"
    if not authorization or authorization.strip() != expected:
        raise HTTPException(status_code=401, detail="Unauthorized")

    target_path = f"/{path}"
    if target_path not in ALLOWED_PATHS:
        raise HTTPException(status_code=404, detail="Endpoint not allowed")

    try:
        async with httpx.AsyncClient(timeout=300.0) as client:
            response = await client.request(
                method=request.method,
                url=f"{OLLAMA_URL}{target_path}",
                params=request.query_params,
                content=await request.body(),
                headers={
                    "Content-Type": request.headers.get(
                        "content-type", "application/json"
                    )
                },
            )
    except httpx.RequestError:
        raise HTTPException(status_code=502, detail="Could not connect to local Ollama")

    return Response(
        content=response.content,
        status_code=response.status_code,
        media_type=response.headers.get("content-type", "application/json"),
    )
