import os
from dotenv import load_dotenv
from openai import OpenAI
from fastapi import FastAPI, File, Form, UploadFile
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import base64

load_dotenv()

my_api_key = os.getenv("OPENAI_API_KEY")

client = OpenAI(api_key=my_api_key)

class ChatRequest(BaseModel):
    prompt : str

class ChatResponse(BaseModel):
    response : str 

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins = ["*"],
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"]
)

@app.post("/")
def ai_prompt(request: ChatRequest):
    completion = client.chat.completions.create(
        model='gpt-4o-mini',
        messages=[
            {
                "role" : "system",
                "content" : "You are a helpful assistant"
            },
            {
                "role" : "user",
                "content" : request.prompt
            }
        ]
    )

    gpt_response = completion.choices[0].message.content
    return ChatResponse(response=gpt_response)


@app.post("/uploadfile/")
async def create_upload_file(
    prompt:str = Form(...),
    file: UploadFile = File(None)
    ):
    base64_image = None
    completion = None
    if file:
        contents = await file.read()
        base64_image = base64.b64encode(contents).decode("utf-8")

        completion = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role" : "user",
                    "content" : [
                        { "type" : "text", "text" : prompt},
                        {
                            "type" : "image_url",
                            "image_url": {
                                "url":f"data:image/jpeg;base64, {base64_image}",
                            },
                        },
                    ],
                }
            ],
        )
    else:
        completion = client.chat.completions.create(
        model='gpt-4o-mini',
        messages=[
            {
                "role" : "system",
                "content" : "You are a helpful assistant"
            },
            {
                "role" : "user",
                "content" : prompt
            }
        ]
    )
        
    if (completion):
        gpt_response = completion.choices[0].message.content
        return ChatResponse(response=gpt_response)
    return {"message" : "No response"}
