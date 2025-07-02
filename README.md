# Slide Agent MVP

## 概要

Slide Agent MVPは、AIを活用してプレゼンテーション作成を自動化するWebアプリケーションです。ユーザーが日本語でプレゼンテーション内容を詳細に入力すると、AWS BedrockのClaude 3.5 Sonnetが自動的に構成案を作成し、最終的にPowerPointファイルを生成・ダウンロードできます。

役員会向けの提案資料や会議資料など、ビジネスシーンでの効率的なプレゼンテーション作成をサポートします。

## 主な機能

### 🎯 プロンプト入力インターフェース
- 詳細なプレゼンテーション要件を日本語で入力
- 説明者・被説明者・目的・前提条件の明確化
- 豊富な入力例とガイダンス

### 🤖 AI構成案生成
- AWS BedrockのClaude 3.5 Sonnetによる高品質な構成案作成
- スライドタイトルと箇条書き本文の自動生成
- JSON形式での構造化されたレスポンス

### 👀 リアルタイムプレビュー
- 生成されたスライド構成の即座表示
- スライドごとの詳細内容確認
- 承認前の内容チェック機能

### 📊 PowerPoint生成
- テンプレートベースでのPPTXファイル作成
- ブラウザ経由での直接ダウンロード
- カスタマイズ可能なスライドレイアウト

## 技術スタック

### バックエンド
- **FastAPI** - 高性能WebAPIフレームワーク
- **LangChain** - AI/LLMアプリケーション開発フレームワーク
- **AWS Bedrock** - Claude 3.5 Sonnet AIモデル
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
│   │   └── App.jsx                 # Reactメインアプリケーション
│   ├── index.html                  # HTMLエントリーポイント
│   ├── package.json                # Node.js依存関係
│   └── package-lock.json           # ロックファイル
├── myenv/                          # Python仮想環境
├── Makefile                        # ビルド自動化ファイル
└── README.md                       # プロジェクトドキュメント
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
3. 「構成案を生成」ボタンをクリック
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
- `POST /api/generate-outline` - スライド構成案生成
- `POST /api/create-presentation` - PowerPointファイル生成

### 設定項目
- **CORS設定**: `http://localhost:5173` (Viteデフォルトポート)
- **AIモデル**: Claude 3.5 Sonnet (temperature: 0.2)
- **PowerPointレイアウト**: テンプレートの5番目のレイアウト使用

### 開発時の注意点
- AWS Bedrock APIの利用には適切な認証情報が必要
- PowerPointテンプレート(`template.pptx`)の存在を確認
- フロントエンドとバックエンドの両方を起動する必要あり

### トラブルシューティング
- **AWS認証エラー**: `~/.aws/credentials`の設定を確認
- **CORS エラー**: バックエンドのCORS設定を確認
- **PowerPoint生成エラー**: テンプレートファイルの存在を確認

## 今後の拡張予定

- [ ] 複数のPowerPointテンプレート対応
- [ ] スライド内容の手動編集機能
- [ ] 画像・図表の自動挿入
- [ ] 複数言語対応
- [ ] ユーザー認証機能
- [ ] 生成履歴の保存機能

## ライセンス

このプロジェクトは開発中のMVP（Minimum Viable Product）です。商用利用については開発者にお問い合わせください。

---

**Note**: このアプリケーションはAWS Bedrockを使用するため、API利用料金が発生する可能性があります。使用前に料金体系をご確認ください。