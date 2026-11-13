from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import json
import os

app = FastAPI(title="Echoes of Silence API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "online", "project": "Echoes of Silence - NASA Space Apps Cairo 2026"}

@app.get("/api/artifacts")
def get_artifacts():
    json_path = os.path.join(os.path.dirname(__file__), "artifacts.json")
    if not os.path.exists(json_path):
        return []
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data