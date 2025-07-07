# Slide Agent MVP

## 概要

Slide Agent MVPは、生成AIを活用してプレゼンテーション作成を自動化するWebアプリケーションです。
ユーザーが日本語でプレゼンテーション内容を入力すると、AWS Bedrockを利用して自動的に構成案を作成し、
生成AIの案をベースにpython-pptxライブラリでスライドを生成、最終的にPowerPointファイルをダウンロードできます。

役員会向けの提案資料や会議資料など、ビジネスシーンでの効率的なプレゼンテーション作成をサポートします。

## 主な機能

### 🎯 プロンプト入力インターフェース
- 詳細なプレゼンテーション要件を日本語で入力
- 説明者・被説明者・目的・前提条件の明確化

### 🤖 AI構成案生成
- LLMによるスライドのストーリー、章構成案の自動作成（AWS Bedrock利用）
- 「序論・本論・結論」フレームワークに基づく論理的構成
- 各スライドは、内容からLLMがテキストor表を自動で判定して作成

### 👀 リアルタイムプレビュー
- LLMが生成したスライド構成案の表示、ユーザ承認で実行
- スライドごとの詳細内容確認
- LLMが考えた章構成の妥当性もきちんと表示、説明してくれる

### 📊 PowerPoint生成
- テンプレートベースでのPPTXファイル作成。テンプレは差し替え可能

## 技術スタック

### バックエンド
- **FastAPI** - 高性能WebAPIフレームワーク
- **LangChain** - AI/LLMアプリケーション開発フレームワーク
- **AWS Bedrock** - LLM推論（今回はClaude 3.5 Sonnetを利用）
- **python-pptx** - PowerPoint生成ライブラリ
- **Pydantic** - データバリデーション
- **uvicorn** - ASGIサーバー

### フロントエンド
- **React 18** - UIフレームワーク
- **Vite 5.2** - 高速開発環境・ビルドツール
- **Axios** - HTTP通信ライブラリ
- **インラインCSS** - レスポンシブデザイン

### インフラ・開発環境
- **Python 3.12.3** - バックエンド実行環境
- **Node.js** - フロントエンド開発環境
- **AWS認証** - Bedrock API アクセス

## ディレクトリ構造

```
slide-agent-mvp/
├── backend/                          # FastAPI + LangChain バックエンド
│   ├── main.py                      # メインAPIサーバー
│   ├── requirements.txt             # Python依存関係
│   ├── template.pptx               # PowerPointテンプレート
│   └── generated_presentation.pptx  # 生成されたファイル
├── frontend/                        # React + Vite フロントエンド
│   ├── src/
│   │   ├── App.jsx                 # Reactメインアプリケーション
│   │   └── main.jsx                # Reactエントリーポイント
│   ├── index.html                  # HTMLエントリーポイント
│   ├── package.json                # Node.js依存関係
│   ├── package-lock.json           # ロックファイル
│   └── vite.config.js              # Vite設定ファイル
├── Makefile                         # ビルド自動化ファイル（空）
└── README.md                        # プロジェクトドキュメント
```

## セットアップ・インストール方法

### 前提条件
- Python 3.12以上
- Node.js 18以上
- AWS認証情報の設定（~/.aws/credentials）

### 1. リポジトリのクローン
```bash
git clone <repository-url>
cd slide-agent-mvp
```

### 2. バックエンドのセットアップ
```bash
# 仮想環境のアクティベート
source myenv/bin/activate

# 依存関係のインストール
cd backend
pip install -r requirements.txt
```

### 3. フロントエンドのセットアップ
```bash
cd frontend
npm install
```

### 4. AWS認証情報の設定
```bash
# ~/.aws/credentials ファイルに以下を追加
[default]
aws_access_key_id = YOUR_ACCESS_KEY
aws_secret_access_key = YOUR_SECRET_KEY
region = us-east-1
```

## 使用方法

### 1. バックエンドサーバーの起動
```bash
cd backend
source ../myenv/bin/activate
uvicorn main:app --reload --port 8000
```

### 2. フロントエンドサーバーの起動
```bash
cd frontend
npm run dev
```

### 3. アプリケーションの使用
1. ブラウザで `http://localhost:5173` にアクセス
2. プレゼンテーション内容を日本語で詳細に入力
3. 「計画案を生成」ボタンをクリック
4. 生成された構成案を確認
5. 「承認してPowerPointを作成」ボタンでPPTXファイルをダウンロード

### 入力例
```
オフィスのペーパーレス化推進に関する課題と解決策を役員会に提案するスライドを作成してください。

【説明したい内容】
・現状の紙文書による課題（コスト、管理工数、セキュリティリスク）
・ペーパーレス化のメリット（具体例を挙げて）
・導入するシステム案（クラウド型文書管理システム）
・導入にかかる費用と費用対効果
・今後のロードマップ

【説明者】
総務部 部長

【被説明者】
役員会メンバー（意思決定者）

【説明目的】
ペーパーレス化プロジェクトの予算承認と、全社的な取り組み推進の合意形成を得ること。
```

## 開発者向け情報

### APIエンドポイント
- `GET /` - ヘルスチェック
- `POST /api/generate-plan` - スライド構成案生成
- `POST /api/create-slides` - PowerPointファイル生成

### 主要コンポーネント
- `run_supervisor_agent` - プレゼン全体の計画立案 (`backend/main.py:65-88`)
- `run_text_agent` - テキストスライド内容生成 (`backend/main.py:90-99`)
- `run_table_agent` - 表スライド内容生成 (`backend/main.py:101-110`)

### 設定項目
- **CORS設定**: `http://localhost:5173` (Viteデフォルトポート)
- **AIモデル**: Claude 3.5 Sonnet (temperature: 0.1) 一例であり必須ではない
- **PowerPointレイアウト**: テンプレートの5番目のレイアウト使用
- **日本語フォント**: BIZ UDPGothic （変更可能）

### 処理フロー
1. **プロンプト入力**: ユーザーが日本語で要件入力
2. **構成案生成**: AIが「序論・本論・結論」で構成案作成
3. **プレビュー**: 生成された構成案をリアルタイム表示
4. **PowerPoint生成**: 各スライドの内容を生成し、python-pptxでPPTX作成

### 開発時の注意点
- AWS Bedrock APIの利用には適切な認証情報が必要
- PowerPointテンプレート(`template.pptx`)の存在を確認
- フロントエンドとバックエンドの両方を起動する必要あり

### トラブルシューティング
- **AWS認証エラー**: `~/.aws/credentials`の設定を確認
- **CORS エラー**: バックエンドのCORS設定を確認
- **PowerPoint生成エラー**: テンプレートファイルの存在を確認

## ライセンス

このプロジェクトは開発中のMVP（Minimum Viable Product）です。

---

**Note**: このアプリケーションはAWS Bedrockを使用するため、API利用料金が発生します。使用前に料金体系をご確認ください。