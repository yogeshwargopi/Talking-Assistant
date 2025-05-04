from fastapi import APIRouter
from app.routes.user.model import *

router = APIRouter()

def initGetUserInput(requestBody):
    return requestBody

@router.post('/getUserInput')
async def getUserInput(requestBody: UserInputModel):
    requestBody = requestBody.model_dump()
    return initGetUserInput(requestBody)