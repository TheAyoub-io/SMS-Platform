from fastapi import FastAPI
from app.api.v1.endpoints import auth, campaigns

app = FastAPI()

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(campaigns.router, prefix="/campaigns", tags=["campaigns"])

@app.get("/")
def read_root():
    return {"Hello": "World"}
