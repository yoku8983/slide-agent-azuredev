# Makefile for Slide Agent - Azure Version (Simple)

# デフォルトターゲット
.PHONY: help
help:
	@echo "========================================"
	@echo "スライド作成AIエージェント - Makefile"
	@echo "========================================"
	@echo ""
	@echo "📦 セットアップ:"
	@echo "  make setup       - 初期セットアップ（依存関係のインストール）"
	@echo ""
	@echo "🐳 Docker操作:"
	@echo "  make build       - Dockerイメージのビルド"
	@echo "  make run         - ローカルでコンテナを実行"
	@echo "  make stop        - 実行中のコンテナを停止"
	@echo ""
	@echo "☁️  Azure ACR操作:"
	@echo "  make push        - Azure Container Registryへプッシュ"
	@echo ""
	@echo "🧪 テスト:"
	@echo "  make test-connection - Azure OpenAI接続テスト"
	@echo "  make health      - ヘルスチェック（ローカル）"
	@echo ""
	@echo "🧹 その他:"
	@echo "  make clean       - 生成ファイルのクリーンアップ"
	@echo "  make logs        - Dockerコンテナのログ表示"

# 初期セットアップ
.PHONY: setup
setup:
	@echo "📦 依存関係をインストール中..."
	cd backend && pip install -r requirements.txt
	cd frontend && npm install
	@echo "✅ セットアップ完了！"

# Dockerイメージのビルド
.PHONY: build
build:
	@echo "🔨 Dockerイメージをビルド中..."
	docker build -t slide-agent:latest .
	@echo "✅ ビルド完了！"

# ローカル実行
.PHONY: run
run: build
	@echo "🚀 アプリケーションを起動中..."
	docker compose up

# バックグラウンド実行
.PHONY: run-detached
run-detached: build
	@echo "🚀 アプリケーションをバックグラウンドで起動中..."
	docker compose up -d
	@echo "✅ 起動完了！"
	@echo "📍 URL: http://localhost:8000"

# コンテナの停止
.PHONY: stop
stop:
	@echo "🛑 コンテナを停止中..."
	docker compose down
	@echo "✅ 停止完了！"

# Azure Container Registry へのプッシュ
.PHONY: push
push:
	@echo "📤 ACR へイメージをプッシュ中..."
	@echo "前提: Azure CLIでログイン済み、.envファイルにACR情報設定済み"
	@echo ""
	@if [ ! -f .env ]; then \
		echo "❌ .env ファイルが見つかりません"; \
		echo "   .env.example をコピーして設定してください"; \
		exit 1; \
	fi
	@echo "以下のコマンドを手動で実行してください:"
	@echo "  1. az acr login --name <your-acr-name>"
	@echo "  2. docker tag slide-agent:latest <your-acr-name>.azurecr.io/slide-agent:latest"
	@echo "  3. docker push <your-acr-name>.azurecr.io/slide-agent:latest"

# Azure OpenAI 接続テスト
.PHONY: test-connection
test-connection:
	@echo "🔌 Azure OpenAI Service接続テスト中..."
	@if [ ! -f .env ]; then \
		echo "❌ .env ファイルが見つかりません"; \
		exit 1; \
	fi
	cd backend && python test_azure_connection.py

# ヘルスチェック（ローカル）
.PHONY: health
health:
	@echo "💓 ヘルスチェック中..."
	@curl -f http://localhost:8000/health || echo "❌ ヘルスチェック失敗（コンテナが起動していない可能性があります）"

# Dockerコンテナのログ表示
.PHONY: logs
logs:
	@echo "📜 コンテナのログを表示中..."
	docker compose logs -f

# クリーンアップ
.PHONY: clean
clean:
	@echo "🧹 クリーンアップ中..."
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete
	rm -f backend/generated_presentation*.pptx
	docker compose down --volumes 2>/dev/null || true
	@echo "✅ クリーンアップ完了！"

# フロントエンドのビルド（個別実行用）
.PHONY: build-frontend
build-frontend:
	@echo "🎨 フロントエンドをビルド中..."
	cd frontend && npm run build
	@echo "✅ フロントエンドのビルド完了！"

# 開発モード（ホットリロード）
.PHONY: dev
dev:
	@echo "🔄 開発モードで起動中（ホットリロード有効）..."
	@echo "バックエンド: http://localhost:8000"
	@echo "フロントエンド: http://localhost:5173"
	cd backend && uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
	cd frontend && npm run dev