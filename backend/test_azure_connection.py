#!/usr/bin/env python3
"""
Azure OpenAI Service接続テストスクリプト
実行前に環境変数を設定してください。
"""

import os
import asyncio
from dotenv import load_dotenv
from langchain_openai import AzureChatOpenAI
from langchain_core.messages import HumanMessage

# .envファイルから環境変数を読み込み
load_dotenv()

async def test_azure_openai_connection():
    """Azure OpenAI Serviceとの接続をテスト"""
    
    print("=" * 50)
    print("Azure OpenAI Service 接続テスト")
    print("=" * 50)
    
    # 環境変数の確認
    required_vars = {
        "AZURE_OPENAI_ENDPOINT": os.getenv("AZURE_OPENAI_ENDPOINT"),
        "AZURE_OPENAI_API_KEY": os.getenv("AZURE_OPENAI_API_KEY"),
        "AZURE_OPENAI_DEPLOYMENT_NAME": os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME"),
        "AZURE_OPENAI_API_VERSION": os.getenv("AZURE_OPENAI_API_VERSION", "2024-02-15-preview")
    }
    
    # 環境変数のチェック
    missing_vars = [k for k, v in required_vars.items() if not v]
    if missing_vars:
        print("❌ 以下の環境変数が設定されていません:")
        for var in missing_vars:
            print(f"   - {var}")
        print("\n.envファイルを確認してください。")
        return False
    
    print("✅ 環境変数の確認完了")
    print(f"   エンドポイント: {required_vars['AZURE_OPENAI_ENDPOINT']}")
    print(f"   デプロイメント: {required_vars['AZURE_OPENAI_DEPLOYMENT_NAME']}")
    print(f"   APIバージョン: {required_vars['AZURE_OPENAI_API_VERSION']}")
    print()
    
    try:
        # Azure OpenAI クライアントの初期化
        print("🔄 Azure OpenAI クライアントを初期化中...")
        llm = AzureChatOpenAI(
            azure_endpoint=required_vars["AZURE_OPENAI_ENDPOINT"],
            api_key=required_vars["AZURE_OPENAI_API_KEY"],
            azure_deployment=required_vars["AZURE_OPENAI_DEPLOYMENT_NAME"],
            api_version=required_vars["AZURE_OPENAI_API_VERSION"],
#            temperature=0.1
#            max_tokens=100
        )
        print("✅ クライアント初期化完了")
        print()
        
        # テストメッセージの送信
        print("🔄 テストメッセージを送信中...")
        test_message = HumanMessage(content="こんにちは！これは接続テストです。簡潔に応答してください。")
        response = await llm.ainvoke([test_message])
        
        print("✅ 応答を受信しました:")
        print("-" * 30)
        print(response.content)
        print("-" * 30)
        print()
        
        # スライド生成のテスト
        print("🔄 スライド生成機能をテスト中...")
        slide_test_prompt = """
        以下のJSON形式で、簡単なプレゼンテーション計画を生成してください：
        {
            "plan": [
                {"topic": "導入", "slide_type": "text_slide"},
                {"topic": "比較", "slide_type": "table_slide"}
            ],
            "rationale": "テスト用の構成"
        }
        """
        
        slide_response = await llm.ainvoke([HumanMessage(content=slide_test_prompt)])
        print("✅ スライド生成テスト完了")
        print()
        
        print("=" * 50)
        print("🎉 すべてのテストが成功しました！")
        print("Azure OpenAI Serviceは正常に動作しています。")
        print("=" * 50)
        return True
        
    except Exception as e:
        print(f"❌ エラーが発生しました: {e}")
        print("\n考えられる原因:")
        print("1. APIキーが正しくない")
        print("2. エンドポイントURLが正しくない")
        print("3. デプロイメント名が正しくない")
        print("4. ネットワーク接続の問題")
        print("5. Azure OpenAI Serviceのクォータ制限")
        return False

def main():
    """メイン関数"""
    result = asyncio.run(test_azure_openai_connection())
    exit(0 if result else 1)

if __name__ == "__main__":
    main()