FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .

RUN pip install -r requirements.txt

COPY . .

EXPOSE 7000

CMD ["sh", "-c", "uvicorn app.app:app --host 0.0.0.0 --reload --port 7000"]