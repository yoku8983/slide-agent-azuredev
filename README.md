# スライド作成AIエージェント - Azure OpenAI版

## 概要
AWS Bedrock版から Azure OpenAI Service版への移行版です。
ローカルでの動作確認後、Azure Container Registry (ACR) にプッシュできます。

## 前提条件
- Docker Desktop がインストール済み
- Azure OpenAI Service のリソースが作成済み（GPT-4デプロイ済み）
- Node.js 18+ と Python 3.12+ がインストール済み

## セットアップ手順

### 1. 環境変数の設定

```bash
# .env.example を .env にコピー
cp .env.example .env

# .env ファイルを編集
nano .env  # またはお好みのエディタで
```

以下の値を Azure Portal から取得して設定：
```
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_API_KEY=実際のAPIキー
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-5-mini
AZURE_OPENAI_API_VERSION=2024-12-01-preview
```

### 2. ローカルテスト

```bash
# 依存関係のインストール（初回のみ）
make setup

# Azure OpenAI接続テスト
make test-connection

# Dockerコンテナの起動
make run

# ブラウザでアクセス
open http://localhost:8000
```

### 3. 動作確認

1. ブラウザで http://localhost:8000 にアクセス
2. プロンプトを入力（例：「AIの基礎について3枚のスライドを作成」）
3. 「計画案を生成」をクリック
4. 計画を確認して「承認してPowerPointを作成」をクリック
5. PowerPointファイルがダウンロードされることを確認

### 4. Azure Container Registry へのプッシュ

Azure Portal で ACR を作成済みの場合：

```bash
# Azure CLI でログイン
az login

# ACR にログイン（your-acr-name は実際のACR名に置き換え）
az acr login --name your-acr-name

# イメージにタグ付け
docker tag slide-agent:latest your-acr-name.azurecr.io/slide-agent:latest

# ACR にプッシュ
docker push your-acr-name.azurecr.io/slide-agent:latest
```

## よく使うコマンド

```bash
make help           # ヘルプ表示
make build          # Dockerイメージのビルド
make run            # コンテナ起動
make stop           # コンテナ停止
make logs           # ログ表示
make health         # ヘルスチェック
make clean          # クリーンアップ
make test-connection # Azure OpenAI接続テスト
```

## トラブルシューティング

### Azure OpenAI接続エラー
- APIキーとエンドポイントが正しいか確認
- デプロイメント名が正しいか確認
- ファイアウォール設定を確認

### Dockerコンテナが起動しない
```bash
# ログを確認
make logs

# コンテナを停止してクリーン
make stop
make clean
make build
make run
```

### PowerPoint生成エラー
- `backend/template.pptx` が存在することを確認
- フォント「BIZ UDPGothic」がシステムにインストールされているか確認

## ファイル構成

```
slide-agent-mvp/
├── .env                    # 環境変数（作成する）
├── .env.example            # 環境変数テンプレート
├── Makefile                # ビルド・実行コマンド
├── Dockerfile              # コンテナ定義
├── docker-compose.yml      # Docker Compose設定
├── backend/
│   ├── main.py            # FastAPIアプリ（Azure OpenAI対応）
│   ├── requirements.txt    # Pythonパッケージ
│   ├── test_azure_connection.py  # 接続テストスクリプト
│   └── template.pptx      # PowerPointテンプレート
└── frontend/
    └── (変更なし)
```

## 注意事項

- `.env` ファイルは Git にコミットしないでください
- APIキーは安全に管理してください
- 本番環境では CORS 設定を適切に行ってください
- Azure OpenAI のレート制限に注意してください

## Azure Container Apps へのデプロイ（オプション）

ACRにプッシュ後、Azure Portal から Container Apps を作成：

1. Azure Portal で「Container Apps」を検索
2. 「作成」をクリック
3. 基本設定：
   - リソースグループを選択
   - Container App名を入力
   - リージョンを選択
4. コンテナー設定：
   - イメージソース：Azure Container Registry
   - レジストリとイメージを選択
5. 環境変数を設定：
   - `AZURE_OPENAI_ENDPOINT`
   - `AZURE_OPENAI_API_KEY`
   - `AZURE_OPENAI_DEPLOYMENT_NAME`
   - `AZURE_OPENAI_API_VERSION`

```
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_API_KEY=実際のAPIキー
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-5-mini
AZURE_OPENAI_API_VERSION=2024-12-01-preview
```

6. イングレス設定：
   - HTTPトラフィック：有効
   - ターゲットポート：8000
   - 外部からのアクセス：許可
7. 「確認と作成」→「作成」

デプロイ完了後、提供されたURLでアプリにアクセスできます。