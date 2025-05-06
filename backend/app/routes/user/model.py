from pydantic import BaseModel
from typing import Optional, List

class UserInputModel(BaseModel):
    message:str