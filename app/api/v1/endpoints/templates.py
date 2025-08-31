from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.v1.schemas import template as template_schema
from app.services import template_service
from app.db.session import get_db
from app.db.models import Agent
from app.core.security import get_current_user

router = APIRouter()

@router.post("/", response_model=template_schema.Template)
def create_template(
    template: template_schema.TemplateCreate,
    db: Session = Depends(get_db),
    current_user: Agent = Depends(get_current_user),
):
    """
    Create new message template.
    """
    return template_service.create_template(db=db, template=template, agent_id=current_user.id_agent)


@router.get("/", response_model=List[template_schema.Template])
def read_templates(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: Agent = Depends(get_current_user),
):
    """
    Retrieve message templates.
    """
    templates = template_service.get_templates(db, skip=skip, limit=limit)
    return templates


@router.get("/{template_id}", response_model=template_schema.Template)
def read_template(
    template_id: int,
    db: Session = Depends(get_db),
    current_user: Agent = Depends(get_current_user),
):
    """
    Get message template by ID.
    """
    db_template = template_service.get_template(db, template_id=template_id)
    if db_template is None:
        raise HTTPException(status_code=404, detail="Template not found")
    return db_template


@router.put("/{template_id}", response_model=template_schema.Template)
def update_template(
    template_id: int,
    template: template_schema.TemplateUpdate,
    db: Session = Depends(get_db),
    current_user: Agent = Depends(get_current_user),
):
    """
    Update a message template.
    """
    db_template = template_service.get_template(db, template_id=template_id)
    if db_template is None:
        raise HTTPException(status_code=404, detail="Template not found")
    return template_service.update_template(db=db, template_id=template_id, template=template)


@router.delete("/{template_id}", response_model=template_schema.Template)
def delete_template(
    template_id: int,
    db: Session = Depends(get_db),
    current_user: Agent = Depends(get_current_user),
):
    """
    Delete a message template.
    """
    db_template = template_service.get_template(db, template_id=template_id)
    if db_template is None:
        raise HTTPException(status_code=404, detail="Template not found")
    return template_service.delete_template(db=db, template_id=template_id)
