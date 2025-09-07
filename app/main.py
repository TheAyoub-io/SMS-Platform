from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.endpoints import auth, campaigns, contacts, templates, messages, reports, users, webhooks, mailing_lists, tasks

app = FastAPI()

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(campaigns.router, prefix="/campaigns", tags=["campaigns"])
app.include_router(contacts.router, prefix="/contacts", tags=["contacts"])
app.include_router(templates.router, prefix="/templates", tags=["templates"])
app.include_router(messages.router, prefix="/messages", tags=["messages"])
app.include_router(reports.router, prefix="/reports", tags=["reports"])
app.include_router(webhooks.router, prefix="/webhooks", tags=["webhooks"])
app.include_router(mailing_lists.router, prefix="/mailing-lists", tags=["mailing-lists"])
app.include_router(tasks.router, prefix="/tasks", tags=["tasks"])

@app.get("/")
def read_root():
    return {
        "message": "SMS Campaign Platform API",
        "status": "running",
        "version": "1.0.0",
        "features": [
            "Advanced Contact Management",
            "Excel/CSV Import",
            "Contact Segmentation",
            "Personalized SMS Campaigns",
            "Campaign Analytics"
        ]
    }
