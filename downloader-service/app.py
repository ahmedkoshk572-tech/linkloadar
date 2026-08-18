import os
import re
import subprocess
from typing import Any
from urllib.parse import urlparse

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

app = FastAPI(title="LinkLoad Self-hosted Downloader", version="1.0.0")
origins = [item.strip() for item in os.getenv("ALLOW_ORIGINS", "*").split(",") if item.strip()]
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_credentials=False, allow_methods=["GET"], allow_headers=["*"])


def validate_url(value: str) -> str:
    parsed = urlparse(value)
    if parsed.scheme not in {"http", "https"} or not parsed.netloc:
        raise HTTPException(status_code=400, detail="Only public HTTP(S) URLs are supported")
    if re.search(r"(^|\.)localhost$|^127\.|^10\.|^192\.168\.|^172\.(1[6-9]|2\d|3[0-1])\.", parsed.hostname or "", re.I):
        raise HTTPException(status_code=400, detail="Private network URLs are not allowed")
    return value


def run_info(url: str) -> dict[str, Any]:
    command = ["yt-dlp", "--dump-single-json", "--no-warnings", "--skip-download", url]
    try:
        result = subprocess.run(command, capture_output=True, text=True, timeout=45, check=True)
    except subprocess.TimeoutExpired as exc:
        raise HTTPException(status_code=504, detail="The provider took too long to respond") from exc
    except subprocess.CalledProcessError as exc:
        raise HTTPException(status_code=422, detail="This public URL is unavailable or unsupported") from exc
    import json
    return json.loads(result.stdout)


@app.get("/health")
def health() -> dict[str, bool]:
    return {"ok": True}


@app.get("/preview")
def preview(url: str = Query(min_length=8)) -> dict[str, Any]:
    info = run_info(validate_url(url))
    formats = []
    for item in info.get("formats", []):
        if not item.get("format_id") or not item.get("url"):
            continue
        formats.append({
            "formatId": item.get("format_id"),
            "ext": item.get("ext"),
            "width": item.get("width"),
            "height": item.get("height"),
            "fps": item.get("fps"),
            "filesize": item.get("filesize") or item.get("filesize_approx"),
            "hasAudio": bool(item.get("acodec") and item.get("acodec") != "none"),
            "hasVideo": bool(item.get("vcodec") and item.get("vcodec") != "none"),
        })
    return {"title": info.get("title"), "thumbnail": info.get("thumbnail"), "duration": info.get("duration"), "uploader": info.get("uploader"), "formats": formats}


@app.get("/download")
def download(url: str = Query(min_length=8), format_id: str = Query(min_length=1)) -> StreamingResponse:
    safe_url = validate_url(url)
    command = ["yt-dlp", "--no-warnings", "--no-playlist", "-f", format_id, "-o", "-", safe_url]
    try:
        process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    except OSError as exc:
        raise HTTPException(status_code=503, detail="Downloader engine is unavailable") from exc

    def stream():
        assert process.stdout is not None
        try:
            while chunk := process.stdout.read(1024 * 128):
                yield chunk
        finally:
            process.kill() if process.poll() is None else None

    return StreamingResponse(stream(), media_type="application/octet-stream", headers={"Content-Disposition": "attachment; filename=linkload-video"})
