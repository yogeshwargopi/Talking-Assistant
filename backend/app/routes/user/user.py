from fastapi import APIRouter, Response
from io import BytesIO
from openai import OpenAI
from app.config import OPENAI_API_KEY
from app.routes.user.model import *

router = APIRouter()

client = OpenAI(api_key=OPENAI_API_KEY)

def initGetUserInput(requestBody):
    completion = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": "You are a concise and helpful assistant named Leo. Always respond in one short, clear paragraph. Avoid headings, bullet points, or extra formatting. Do not include small talk or filler. Focus only on answering the user's question in simple, direct language."
            },
            {
                "role": "user",
                "content": requestBody["message"]
            }
        ]
    )

    text_response = completion.choices[0].message.content
    
    # Create a BytesIO buffer to store the audio
    audio_buffer = BytesIO()
    
    # Generate and stream the audio to the buffer
    with client.audio.speech.with_streaming_response.create(
        model="tts-1",
        voice="alloy",
        input=text_response
    ) as response:
        for chunk in response.iter_bytes():
            audio_buffer.write(chunk)
    
    # Get the audio bytes
    audio_data = audio_buffer.getvalue()
    audio_buffer.close()
    
    # Encode text_response to ASCII, replacing non-ASCII characters
    ascii_text_response = text_response.encode('ascii', 'replace').decode('ascii')
    
    # Return both the text response and audio as bytes
    return Response(
        content=audio_data,
        media_type="audio/mpeg",
        headers={
            "Content-Disposition": "attachment; filename=speech.mp3",
            "Text-Response": ascii_text_response,
            "Access-Control-Expose-Headers": "Text-Response"
        }
    )

@router.post('/getUserInput')
async def getUserInput(requestBody: UserInputModel):
    requestBody = requestBody.model_dump()
    return initGetUserInput(requestBody)