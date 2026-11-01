from fastapi import FastAPI
from train_model import predict_ui_adaptation

app = FastAPI()

@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "message": "CalmUI AI is running!"
    }

@app.post("/api/recommend-ui")
def recommend_ui(event: dict):
    return predict_ui_adaptation(event)
