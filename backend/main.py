from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uvicorn

# Import our agent workflow
from agent import analyze_message

app = FastAPI(title="CyberShield API")

# Allow your frontend (which might be running on a different port or file://) to talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, change this to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define the expected request body from the frontend
class MessageRequest(BaseModel):
    message: str

# Define the response structure
class AnalysisResponse(BaseModel):
    explanation: str
    llm_called: bool
    prob: float

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze(request: MessageRequest):
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")
    
    try:
        # Run the full workflow
        result = analyze_message(request.message, use_llm=True)
        return AnalysisResponse(
            explanation=result["explanation"],
            llm_called=result["llm_called"],
            prob=result["prob"]
        )
    except Exception as e:
        print(f"Server Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# A simple health check endpoint
@app.get("/")
def health_check():
    return {"status": "CyberShield API is running"}

if __name__ == "__main__":
    # Run the server on port 8000
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)