from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
from agent import analyze_message
from ml_lab import get_ml_lab_results, predict_message, analyze_datasets

app = FastAPI(title="CyberShield API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class MessageRequest(BaseModel):
    message: str
class AnalysisResponse(BaseModel):
    explanation: str
    llm_called: bool
    prob: float
class PredictRequest(BaseModel):
    message: str
    algorithm: str

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze(request: MessageRequest):
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")
    try:
        result = analyze_message(request.message, use_llm=True)
        return AnalysisResponse(explanation=result["explanation"], llm_called=result["llm_called"], prob=result["prob"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/ml-lab")
def get_ml_lab():
    return get_ml_lab_results()

@app.post("/api/ml-lab/predict")
def run_prediction(req: PredictRequest):
    return predict_message(req.message, req.algorithm)

@app.get("/api/ml-lab/datasets")
def get_dataset_analysis():
    return analyze_datasets()

@app.get("/")
def health_check():
    return {"status": "CyberShield API is running"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)