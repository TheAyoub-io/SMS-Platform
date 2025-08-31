from pydantic import BaseModel
from typing import Optional, Dict

class TemplateBase(BaseModel):
    nom_modele: str
    contenu_modele: str
    variables: Optional[Dict[str, str]] = None

class TemplateCreate(TemplateBase):
    pass

class TemplateUpdate(TemplateBase):
    pass

class TemplateInDBBase(TemplateBase):
    id_modele: int
    created_by: int

    class Config:
        orm_mode = True

class Template(TemplateInDBBase):
    pass
