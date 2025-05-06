import os

ENVIRONMENT = os.getenv('ENV_TYPE', 'development')

GROQ_API_KEY = os.environ["GROQ_API_KEY"]
OPENAI_API_KEY = os.environ["OPENAI_API_KEY"]