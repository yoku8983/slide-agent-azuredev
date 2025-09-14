# スライド作成AIエージェント - Azure版

## 変更点の概要

このバージョンは、元のAWS Bedrock版から以下の変更を加えています：

- **AI推論エンジン**: AWS Bedrock → Azure OpenAI Service
- **デプロイ環境**: AWS → Azure Container Apps (ACA)
- **コンテナレジストリ**: Docker Hub/ECR → Azure Container Registry (ACR)

## 前提条件

### 必要なツール
- Docker Desktop
- Azure CLI (`az` コマンド)
- Node.js 18以上
- Python 3.12以上

### Azure リソース
- Azure サブスクリプション
- Azure OpenAI Service リソース（GPTモデルがデプロイ済み）
- Azure Container Registry (ACR)
- Azure Container Apps 環境

## セットアップ手順

### 1. Azure OpenAI Service の準備

1. Azure Portal で Azure OpenAI Service リソースを作成
2. GPT モデルをデプロイ
3. エンドポイントとAPIキーを取得

### 2. Azure リソースの作成

```bash
# リソースグループの作成
az group create --name slide-agent-rg --location japaneast

# Azure Container Registry の作成
az acr create --resource-group slide-agent-rg \
  --name slideagentacr \
  --sku Basic

# Container Apps 環境の作成
az containerapp env create \
  --name slide-agent-env \
  --resource-group slide-agent-rg \
  --location japaneast
```

### 3. 環境変数の設定

`.env.example` を `.env` にコピーして編集：

```bash
cp .env.example .env
```

`.env` ファイルを編集：
```env
# Azure OpenAI Service設定
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_API_KEY=your-api-key-here
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4
AZURE_OPENAI_API_VERSION=2024-02-15-preview

# Azure Container Registry設定
ACR_NAME=slideagentacr
ACR_LOGIN_SERVER=slideagentacr.azurecr.io
RESOURCE_GROUP=slide-agent-rg
ACA_ENVIRONMENT=slide-agent-env
ACA_APP_NAME=slide-agent-app
```

### 4. ローカルでのテスト

#### Docker Compose を使用
```bash
# イメージのビルドと起動
docker-compose up --build

# ブラウザでアクセス
open http://localhost:8000
```

#### 手動でのテスト
```bash
# Dockerイメージのビルド
docker build -t slide-agent-local .

# コンテナの起動
docker run -p 8000:8000 --env-file .env slide-agent-local
```

### 5. Azure へのデプロイ

手動でデプロイ：

```bash
# Azure にログイン
az login

# ACR にログイン
az acr login --name slideagentacr

# イメージのビルドとプッシュ
docker build -t slideagentacr.azurecr.io/slide-agent:latest .
docker push slideagentacr.azurecr.io/slide-agent:latest

# Container App の作成
az containerapp create \
  --name slide-agent-app \
  --resource-group slide-agent-rg \
  --environment slide-agent-env \
  --image slideagentacr.azurecr.io/slide-agent:latest \
  --target-port 8000 \
  --ingress external \
  --registry-server slideagentacr.azurecr.io \
  --cpu 0.5 \
  --memory 1.0Gi \
  --min-replicas 0 \
  --max-replicas 10
```

## 主な変更ファイル

### backend/main.py
- `langchain_aws.ChatBedrock` → `langchain_openai.AzureChatOpenAI`
- AWS認証情報 → Azure OpenAI APIキーとエンドポイント
- ヘルスチェックエンドポイントを追加

### backend/requirements.txt
- `langchain-aws` と `boto3` を削除
- `langchain-openai` と `openai` を追加

### Dockerfile
- マルチステージビルドで最適化
- 非rootユーザーでの実行
- ヘルスチェックの追加
- Azure Container Apps の PORT 環境変数対応

## トラブルシューティング

### Azure OpenAI のレート制限エラー
- デプロイメントのTPM（Tokens Per Minute）制限を確認
- `asyncio.sleep()` の待機時間を調整

### Container Apps のデプロイエラー
```bash
# ログの確認
az containerapp logs show \
  --name slide-agent-app \
  --resource-group slide-agent-rg \
  --follow

# リビジョンの確認
az containerapp revision list \
  --name slide-agent-app \
  --resource-group slide-agent-rg
```

### メモリ不足エラー
Container Apps の設定を調整：
```bash
az containerapp update \
  --name slide-agent-app \
  --resource-group slide-agent-rg \
  --cpu 1.0 \
  --memory 2.0Gi
```

## パフォーマンス最適化

### コールドスタート対策
```bash
# 最小レプリカ数を1に設定
az containerapp update \
  --name slide-agent-app \
  --resource-group slide-agent-rg \
  --min-replicas 1
```

### スケーリング設定
```bash
# HTTPスケーリングルールの設定
az containerapp update \
  --name slide-agent-app \
  --resource-group slide-agent-rg \
  --scale-rule-name http-rule \
  --scale-rule-type http \
  --scale-rule-http-concurrency 10
```

## セキュリティ考慮事項

1. **APIキーの管理**: Azure Key Vault の利用を推奨
2. **ネットワーク制限**: 必要に応じてVNET統合を設定
3. **CORS設定**: 本番環境では適切なオリジンを指定
4. **認証**: Azure AD認証の追加を検討

## コスト最適化

- **自動スケーリング**: 最小レプリカを0に設定してコスト削減
- **リソース割り当て**: 実際の使用量に基づいてCPU/メモリを調整
- **リージョン選択**: 利用者に近いリージョンを選択

## ライセンス

MIT License