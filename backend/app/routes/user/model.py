from pydantic import BaseModel
from typing import Optional, List

class UserInputModel(BaseModel):
    authToken:str
    hackathonId: str
    userId: str
    registrationData: dict