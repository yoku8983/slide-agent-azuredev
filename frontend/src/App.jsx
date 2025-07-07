import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:8000';

function App() {
  const [prompt, setPrompt] = useState('');
  const [plan, setPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGeneratePlan = async () => {
    if (!prompt) {
      setError('スライドの内容を入力してください。');
      return;
    }
    setIsLoading(true);
    setError('');
    setPlan(null);
    try {
      const response = await axios.post(`${API_URL}/api/generate-plan`, { prompt });
      setPlan(response.data);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || '計画案の生成に失敗しました。サーバー側のログを確認してください。';
      setError(errorMessage);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSlides = async () => {
    if (!plan) return;
    setIsLoading(true);
    setError('');
    try {
      const response = await axios.post(`${API_URL}/api/create-slides`, plan, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'presentation.pptx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

    } catch (err) {
      const errorBlob = err.response?.data;
      let errorMessage = 'PowerPointファイルの生成に失敗しました。';
      if (errorBlob && errorBlob.type === 'application/json') {
          const errorJson = JSON.parse(await errorBlob.text());
          errorMessage = errorJson.detail || errorMessage;
      }
      setError(errorMessage);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setPrompt('');
    setPlan(null);
    setIsLoading(false);
    setError('');
    setLoadingMessage('');
  };

  const renderPlanPreview = (slidePlan, index) => {
    const slideTypeJa = slidePlan.slide_type === 'text_slide' ? 'テキスト' : '表';
    return (
      <div key={index} className="slide-card">
        <h3>{`スライド ${index + 1}: ${slideTypeJa}形式`}</h3>
        <p><strong>トピック:</strong> {slidePlan.topic}</p>
      </div>
    );
  };
  
  const styles = `
    body { background-color: #f0f2f5; margin: 0; }
    .container { max-width: 800px; margin: 2rem auto; padding: 1rem; font-family: 'Helvetica Neue', Arial, sans-serif; }
    h1 { text-align: center; color: #333; }
    .card { background: white; border-radius: 8px; padding: 1.5rem 2rem; margin-bottom: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    h2 { margin-top: 0; color: #1a1a1a; }
    .slide-card { background: #f9f9f9; border: 1px solid #e0e0e0; border-radius: 6px; padding: 1rem; margin-bottom: 1rem; }
    .slide-card h3 { margin: 0 0 0.5rem 0; font-size: 1.1rem; }
    .slide-card p { margin: 0; }
    .error { color: #d93025; font-weight: bold; text-align: center; margin: 1rem 0; }
    .plan-preview { max-height: 40vh; overflow-y: auto; padding-right: 10px; }
    textarea { width: 100%; box-sizing: border-box; min-height: 120px; padding: 10px; border: 1px solid #ccc; border-radius: 4px; resize: vertical; font-size: 1rem; }
    button { background-color: #007bff; color: white; border: none; padding: 0.8rem 1.5rem; border-radius: 5px; cursor: pointer; font-size: 1rem; font-weight: 500; display: block; width: 100%; margin-top: 1rem; transition: background-color 0.2s; }
    button:hover:not(:disabled) { background-color: #0056b3; }
    button:disabled { background-color: #6c757d; cursor: not-allowed; }
    .rationale-box { background-color: #e6f7ff; border: 1px solid #91d5ff; border-radius: 6px; padding: 1rem; margin-bottom: 1.5rem; }
    .rationale-box h4 { margin: 0 0 0.5rem 0; color: #0056b3; }
    .rationale-box p { margin: 0; line-height: 1.6; }
  `;

  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
    return () => document.head.removeChild(styleElement);
  }, []);

  return (
    <div className="container">
      <h1>スライド作成 AIエージェント 🤖</h1>

      <button onClick={handleReset} style={{ backgroundColor: '#6c757d', marginBottom: '1rem' }}>
          入力内容を全てクリア
      </button>
      
      <div className="card">
        <h2>1. スライドの内容を入力</h2>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="例：主要SNSであるX, Instagram, Facebookの機能、ユーザー層、広告特性を比較するプレゼン。"
        />
        <button onClick={handleGeneratePlan} disabled={isLoading}>
          {isLoading && !plan ? '計画を生成中...' : '計画案を生成'}
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {plan && (
        <div className="card">
          <h2>2. 生成された計画案を確認・承認</h2>
          
          <div className="rationale-box">
            <h4>この構成案のポイント</h4>
            <p>{plan.rationale}</p>
          </div>

          <div className="plan-preview">
            {plan.plan.map((slidePlan, index) => renderPlanPreview(slidePlan, index))}
          </div>
          <button onClick={handleCreateSlides} disabled={isLoading}>
            {isLoading ? 'PPTXを作成中...' : '承認してPowerPointを作成 ✨'}
          </button>
        </div>
      )}
    </div>
  );
}

export default App;