import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
// import './App.css'; // 簡単なスタイリング用 (CSSをファイルとして作成しない場合はコメントアウトのまま)

// APIサーバーのURL
const API_URL = 'http://localhost:8000';

function App() {
  const [prompt, setPrompt] = useState('');
  const [outline, setOutline] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // 構成案を生成する関数
  const handleGenerateOutline = async () => {
    if (!prompt) {
      setError('スライドの内容を入力してください。');
      return;
    }
    setIsLoading(true);
    setError('');
    setOutline(null);
    try {
      const response = await axios.post(`${API_URL}/api/generate-outline`, { prompt });
      setOutline(response.data);
    } catch (err) {
      setError('構成案の生成に失敗しました。サーバー側のログを確認してください。');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // PowerPointファイルを生成・ダウンロードする関数
  const handleCreatePresentation = async () => {
    if (!outline) return;
    setIsLoading(true);
    setError('');
    try {
      const response = await axios.post(`${API_URL}/api/create-presentation`, outline, {
        responseType: 'blob', // ファイルをバイナリデータとして受け取る
      });
      // ファイルをダウンロード
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'presentation.pptx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('PowerPointファイルの生成に失敗しました。');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>スライド作成 AIエージェント 🤖</h1>

      <div className="card">
        <h2>1. スライドの内容を入力</h2>
        <p>より適切なスライドを作成するために、以下の項目を網羅して入力してください。</p>
        <p className="hint-text">
          例：<br/>
          オフィスのペーパーレス化推進に関する課題と解決策を役員会に提案するスライドを作成してください。<br/><br/>
          【説明したい内容】<br/>
          ・現状の紙文書による課題（コスト、管理工数、セキュリティリスク）<br/>
          ・ペーパーレス化のメリット（具体例を挙げて）<br/>
          ・導入するシステム案（クラウド型文書管理システム）<br/>
          ・導入にかかる費用と費用対効果<br/>
          ・今後のロードマップ<br/><br/>
          【説明者】<br/>
          総務部 部長<br/><br/>
          【被説明者】<br/>
          役員会メンバー（意思決定者）<br/><br/>
          【説明目的】<br/>
          ペーパーレス化プロジェクトの予算承認と、全社的な取り組み推進の合意形成を得ること。<br/><br/>
          【その他前提条件】<br/>
          ・データに基づいた客観的な情報提示を重視する。<br/>
          ・短時間で要点をまとめること（10分以内）。<br/>
          ・懸念される点（移行期間の混乱など）への対応策も盛り込む。
        </p>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={`ここに入力してください`}
          rows="15" // 例の表示のために行数を増やしました
        />
        <button onClick={handleGenerateOutline} disabled={isLoading}>
          {isLoading ? '生成中...' : '構成案を生成'}
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {outline && (
        <div className="card">
          <h2>2. 生成された構成案を確認・承認</h2>
          <div className="outline-preview">
            {outline.slides.map((slide, index) => (
              <div key={index} className="slide-card">
                <h3>{`スライド ${index + 1}: ${slide.title}`}</h3>
                <pre>{slide.content}</pre>
              </div>
            ))}
          </div>
          <button onClick={handleCreatePresentation} disabled={isLoading}>
            {isLoading ? 'PPTX作成中...' : '承認してPowerPointを作成 ✨'}
          </button>
        </div>
      )}
    </div>
  );
}

// 簡単なCSSを追加
const styles = `
.container { max-width: 800px; margin: 2rem auto; font-family: sans-serif; }
.card { background: #f9f9f9; border: 1px solid #ddd; border-radius: 8px; padding: 1.5rem; margin-bottom: 1rem; }
textarea { width: 95%; padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px; font-size: 1rem; }
button { background-color: #007bff; color: white; padding: 0.8rem 1.2rem; border: none; border-radius: 4px; cursor: pointer; font-size: 1rem; margin-top: 1rem; }
button:disabled { background-color: #aaa; }
.error { color: red; }
.outline-preview { max-height: 400px; overflow-y: auto; border: 1px solid #eee; padding: 1rem; background: white; border-radius: 4px; }
.slide-card { margin-bottom: 1rem; }
pre { white-space: pre-wrap; background: #eee; padding: 0.5rem; border-radius: 4px; }
.hint-text {
  font-size: 0.9em;
  color: #555;
  background-color: #eef;
  border-left: 4px solid #007bff;
  padding: 10px;
  margin-bottom: 15px;
  white-space: pre-wrap; /* 改行を保持 */
}
`;
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);


// App コンポーネントを #root 要素にレンダリングする
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

export default App;