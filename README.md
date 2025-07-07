# スライド作成AIエージェント
written by Claude code

## 概要

スライド作成AIエージェントは、自然言語の入力からPowerPointプレゼンテーションを自動生成するAI駆動システムです。
AWS Bedrock上のClaude AIモデルとLangChainを活用し、マルチエージェント設計により高品質なプレゼンテーションを効率的に作成します。

ユーザーは日本語でプレゼンテーションの内容を説明するだけで、
LLMが「序論・本論・結論」の構成に沿った論理的なスライド構成を提案し、承認後に完全なPowerPointファイルを生成します。

## 主な機能

### 🤖 インテリジェントなプレゼンテーション設計
- **計画生成**: 自然言語入力から論理的なスライド構成案を自動生成
- **構成最適化**: 「序論・本論・結論」フレームワークに基づく説得力のある構成
- **スライドタイプ選択**: 内容に応じてテキストスライドまたは表スライドの適切な表現方法を自動判定

### 📊 多様なスライド形式対応
- **テキストスライド**: 箇条書きによる情報整理
- **表スライド**: 比較・対照データの構造化表示
- **フォント統一**: 日本語フォント（BIZ UDPGothic）での一貫したデザイン

### 🎯 マルチエージェント設計
- **Supervisor Agent**: 全体構成の立案と品質管理
- **Text Agent**: テキストスライドの内容生成
- **Table Agent**: 表形式データの構造化

### 🌐 直感的なWebインターフェース
- **リアルタイム生成**: 進捗状況の可視化
- **プレビュー機能**: 生成前の構成案確認
- **ワンクリックダウンロード**: 完成したPowerPointファイルの即座取得

## 技術スタック

### バックエンド
- **FastAPI**: 高性能なPython Web フレームワーク
- **LangChain**: LLMアプリケーション開発フレームワーク
- **AWS Bedrock**: Claude AIモデルの呼び出し
- **python-pptx**: PowerPoint文書の生成・操作

### フロントエンド
- **React 18**: モダンなUIライブラリ
- **Vite**: 高速な開発環境とビルドツール
- **Axios**: HTTP通信ライブラリ

### インフラストラクチャ
- **Docker**: コンテナ化によるデプロイメント
- **uvicorn**: ASGIサーバー

## ディレクトリ構造

```
slide-agent-mvp/
├── README.md                   # プロジェクトドキュメント
├── Dockerfile                  # マルチステージビルド設定
├── Makefile                    # ビルド自動化（現在空）
├── backend/                   # バックエンドアプリケーション
│   ├── main.py               # FastAPIアプリケーション本体
│   ├── requirements.txt      # Python依存関係
│   ├── template.pptx        # PowerPointテンプレート
└── frontend/                  # フロントエンドアプリケーション
    ├── package.json          # Node.js依存関係
    ├── package-lock.json     # 依存関係ロック
    ├── vite.config.js        # Vite設定
    ├── index.html            # HTMLテンプレート
    ├── node_modules/         # Node.js依存関係
    └── src/
        ├── App.jsx           # メインReactコンポーネント
        └── main.jsx          # Reactアプリケーション起動点
```

## セットアップ・インストール方法

### 前提条件
- Python 3.12以上
- Node.js 18以上
- Docker（オプション）
- AWS アカウント（Bedrock利用）

### 1. リポジトリのクローン
```bash
git clone <repository-url>
cd slide-agent-mvp
```

### 2. 環境変数の設定（AWS認証情報）
```bash
# .envファイルを作成し、以下の環境変数を設定
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_DEFAULT_REGION=us-east-1
```

### 3. バックエンドのセットアップ
```bash
# 仮想環境の作成と有効化
python -m venv myenv
source myenv/bin/activate  # Linux/Mac
# または
myenv\Scripts\activate  # Windows

# 依存関係のインストール
cd backend
pip install -r requirements.txt
```

### 4. フロントエンドのセットアップ
```bash
cd frontend
npm install
```

### 5. Dockerを使用した起動（推奨）
```bash
# プロジェクトルートで実行
docker build -t slide-agent-mvp .
docker run -p 8000:8000 --env-file .env slide-agent-mvp
```

## 使用方法

### 開発環境での起動

#### バックエンド起動
```bash
cd backend
source ../myenv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### フロントエンド起動
```bash
cd frontend
npm run dev
```

### 本番環境での起動
```bash
# Dockerを使用
docker build -t slide-agent-mvp .
docker run -p 8000:8000 --env-file .env slide-agent-mvp
```

### 基本的な使用手順

1. **アプリケーションにアクセス**: `http://localhost:8000`
2. **プロンプト入力**: 作成したいプレゼンテーションの内容を自然言語で入力
   ```
   例: 主要SNSであるX, Instagram, Facebookの機能、ユーザー層、広告特性を比較するプレゼン
   ```
3. **計画案生成**: 「計画案を生成」ボタンをクリック
4. **計画確認**: 生成された構成案とその根拠を確認
5. **PowerPoint生成**: 「承認してPowerPointを作成」ボタンをクリック
6. **ファイルダウンロード**: 生成されたPowerPointファイルが自動ダウンロード

### API仕様

#### POST /api/generate-plan
プレゼンテーション計画を生成
```json
{
  "prompt": "プレゼンテーションの内容説明"
}
```

#### POST /api/create-slides
計画に基づいてPowerPointファイルを生成
```json
{
  "plan": [...],
  "rationale": "構成の根拠"
}
```

## 開発者向け情報

### アーキテクチャ設計

#### マルチエージェント設計
システムは3つの専門エージェントで構成：

1. **Supervisor Agent** (`run_supervisor_agent`)
   - 全体構成の立案
   - 序論・本論・結論フレームワークの適用
   - スライドタイプの自動判定

2. **Text Agent** (`run_text_agent`)
   - テキストスライドの内容生成
   - 箇条書き形式の情報整理

3. **Table Agent** (`run_table_agent`)
   - 表形式データの構造化
   - 比較・対照情報の表組み

#### データフロー
```
ユーザー入力 → Supervisor Agent → 計画生成 → 承認 → 
各スライド（Text/Table Agent） → PowerPoint生成 → ダウンロード
```

### カスタマイズ方法

#### AIモデルの変更
`backend/main.py`の`llm`設定を変更：
```python
llm = ChatBedrock(
    model_id="us.anthropic.claude-3-7-sonnet-20250219-v1:0",  # モデルID変更
    model_kwargs={"temperature": 0.1},
)
```

#### PowerPointテンプレート
`backend/template.pptx`を独自のテンプレートに置換可能

#### スライドレイアウト
`draw_table_on_slide`関数でテーブルレイアウトをカスタマイズ

### トラブルシューティング

#### よくある問題
1. **AWS認証エラー**: 環境変数の設定を確認
2. **依存関係エラー**: 仮想環境の有効化を確認
3. **ポート競合**: 既存のプロセスを停止後に再起動
4. **フォントエラー**: システムにBIZ UDPGothicフォントをインストール

#### デバッグ方法
```bash
# バックエンドログの確認
uvicorn main:app --reload --log-level debug

# フロントエンドデバッグ
npm run dev -- --debug
```

## ライセンス

MIT License

Copyright (c) 2024 Slide Agent MVP

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.