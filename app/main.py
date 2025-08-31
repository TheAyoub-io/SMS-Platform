from fastapi import FastAPI
from app.api.v1.endpoints import auth, campaigns, contacts

app = FastAPI()

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(campaigns.router, prefix="/campaigns", tags=["campaigns"])
app.include_router(contacts.router, prefix="/contacts", tags=["contacts"])

@app.get("/")
def read_root():
    return {"Hello": "World"}
