# Stage 1: フロントエンドのビルドステージ
# Node.js環境を使用してReactアプリケーションをビルドします。
FROM node:18-alpine AS builder

WORKDIR /app/frontend

# 依存関係ファイルを先にコピーし、キャッシュを活用します。
COPY frontend/package*.json ./
RUN npm install

# フロントエンドのソースコードを全てコピーします。
COPY frontend/ ./

# 本番用の静的ファイルを生成します。
RUN npm run build


# Stage 2: バックエンドの実行ステージ
# Python環境をセットアップし、ビルド済みのフロントエンドとバックエンドサーバーを配置します。
FROM python:3.12-slim

WORKDIR /app

# 環境変数を設定し、Pythonのログ出力を最適化します。
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# 必要なPythonライブラリをインストールします。
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# バックエンドのソースコードとPowerPointテンプレートをコピーします。
COPY backend/ ./

# Stage 1でビルドしたフロントエンドの静的ファイルをコピーします。
# FastAPIから配信できるように`static`ディレクトリに配置します。
COPY --from=builder /app/frontend/dist ./static

# コンテナがリッスンするポートを公開します。
EXPOSE 8000

# アプリケーションサーバーを起動します。
# 0.0.0.0を指定することで、コンテナ外部からのアクセスを許可します。
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]