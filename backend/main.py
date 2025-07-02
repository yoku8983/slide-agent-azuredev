import os
import json
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List

from langchain_aws import ChatBedrock
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser

from pptx import Presentation
from pptx.util import Inches

# --- 1. アプリケーションの基本設定 ---
app = FastAPI()

# CORS設定 (フロントエンドからのアクセスを許可)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # Viteのデフォルトポート
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 2. データモデルの定義 (Pydantic) ---
class SlideContent(BaseModel):
    title: str = Field(description="スライドのタイトル")
    content: str = Field(description="箇条書き形式のスライド本文")

class PresentationOutline(BaseModel):
    slides: List[SlideContent] = Field(description="スライドのリスト")

class UserInput(BaseModel):
    prompt: str

# --- 3. LangChain & Bedrock の設定 ---
# JSON形式での出力をAIに強制するパーサー
parser = JsonOutputParser(pydantic_object=PresentationOutline)

# BedrockのLLMを初期化
# ~/.aws/credentials に認証情報が設定されていることを前提とします
llm = ChatBedrock(
    model_id="anthropic.claude-3-5-sonnet-20240620-v1:0", # Claude 3.5 Sonnet
    model_kwargs={"temperature": 0.2},
)

# AIへの指示を定義するプロンプトテンプレート
prompt_template = ChatPromptTemplate.from_messages([
    ("system", """
あなたは優秀なプレゼンテーション作成アシスタントです。
ユーザーからの入力に基づき、プレゼンテーションの構成を考え、各スライドのタイトルと箇条書きの本文を作成してください。
以下のJSON形式で、厳密に出力してください。
{format_instructions}
"""),
    ("human", "{user_prompt}"),
])

# LangChainの処理チェーンを定義
chain = prompt_template | llm | parser


# --- 4. APIエンドポイントの定義 ---

@app.get("/")
def read_root():
    return {"message": "Slide Generation AI Agent is running."}

# スライド構成案を生成するエンドポイント
@app.post("/api/generate-outline", response_model=PresentationOutline)
async def generate_outline(user_input: UserInput):
    try:
        # LangChainを実行してAIから構成案を取得
        response = await chain.ainvoke({"user_prompt": user_input.prompt, "format_instructions": parser.get_format_instructions()})
        return response
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail="AIによる構成案の生成に失敗しました。")

# プレゼンテーションファイルを生成するエンドポイント
@app.post("/api/create-presentation")
async def create_presentation(outline: PresentationOutline):
    try:
        # テンプレートファイルを読み込む
        prs = Presentation("template.pptx")
        # 「タイトルとコンテンツ」レイアウトを探す (通常はインデックス5)
        title_and_content_layout = prs.slide_layouts[4]

        for slide_data in outline.slides:
            slide = prs.slides.add_slide(title_and_content_layout)
            
            # プレースホルダーにタイトルと本文を書き込む
            title_shape = slide.shapes.title
            content_shape = slide.placeholders[1] # 本文のプレースホルダー

            title_shape.text = slide_data.title
            content_shape.text = slide_data.content

        # 生成したファイルを一時保存
        output_filename = "generated_presentation.pptx"
        prs.save(output_filename)
        
        # ファイルをクライアントに返送
        return FileResponse(output_filename, media_type='application/vnd.openxmlformats-officedocument.presentationml.presentation', filename=output_filename)
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail="PowerPointファイルの生成に失敗しました。")