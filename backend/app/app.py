from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.routes.user.user import router as userRouter

@asynccontextmanager
async def lifespan(app: FastAPI):
    print('Starting the application')
    yield
    print('Closing the application')

app = FastAPI(lifespan=lifespan)

origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Text-Response"]
)

app.include_router(userRouter)