from sqlalchemy.orm import Session
from app.db.models import MessageTemplate
from app.api.v1.schemas.template import TemplateCreate, TemplateUpdate

def create_template(db: Session, template: TemplateCreate, agent_id: int):
    db_template = MessageTemplate(**template.model_dump(), created_by=agent_id)
    db.add(db_template)
    db.commit()
    db.refresh(db_template)
    return db_template

def get_template(db: Session, template_id: int):
    return db.query(MessageTemplate).filter(MessageTemplate.id_modele == template_id).first()

def get_templates(db: Session, skip: int = 0, limit: int = 100):
    return db.query(MessageTemplate).offset(skip).limit(limit).all()

def update_template(db: Session, template_id: int, template: TemplateUpdate):
    db_template = get_template(db, template_id)
    if db_template:
        for key, value in template.model_dump().items():
            setattr(db_template, key, value)
        db.commit()
        db.refresh(db_template)
    return db_template

def delete_template(db: Session, template_id: int):
    db_template = get_template(db, template_id)
    if db_template:
        db.delete(db_template)
        db.commit()
    return db_template
