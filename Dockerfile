# Stage 1: フロントエンドのビルドステージ
FROM node:18-alpine AS builder

WORKDIR /app/frontend

# 依存関係ファイルを先にコピーし、キャッシュを活用
COPY frontend/package*.json ./
RUN npm ci --only=production

# フロントエンドのソースコードをコピー
COPY frontend/ ./

# 本番用の静的ファイルを生成
RUN npm run build


# Stage 2: バックエンドの実行ステージ（マルチステージビルドで軽量化）
FROM python:3.12-slim

# 作業ディレクトリを設定
WORKDIR /app

# 環境変数を設定（Pythonの最適化）
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# システムパッケージの更新と必要なツールのインストール
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Pythonの依存関係をインストール
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# バックエンドのソースコードをコピー
COPY backend/ ./

# Stage 1でビルドしたフロントエンドの静的ファイルをコピー
COPY --from=builder /app/frontend/dist ./static

# 非rootユーザーを作成して実行（セキュリティ向上）
RUN useradd -m -u 1001 appuser && chown -R appuser:appuser /app
USER appuser

# ヘルスチェック用のエンドポイント追加
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8000/health')" || exit 1

# Azure Container Appsは環境変数PORTを使用
EXPOSE 8000

# アプリケーションサーバーを起動
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]