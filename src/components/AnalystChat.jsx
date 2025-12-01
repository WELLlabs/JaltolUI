import React, { useState, useRef, useEffect } from 'react';
import { Upload, Send, Check, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { createCMProject, uploadDataset, analyzeDataset, confirmIngestion } from '../services/continuousMonitoringApi';
import './AnalystChat.css';

const AnalystChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'analyst',
      text: "Hi! I'm your Jaltol Analyst. Upload a CSV file and I'll help you analyze and visualize your data.",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [projectId, setProjectId] = useState(null);
  const [datasetId, setDatasetId] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const messageIdRef = useRef(2);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (sender, text, data = null) => {
    const nextId = messageIdRef.current++;
    setMessages(prev => [...prev, {
      id: nextId,
      sender,
      text,
      data,
      timestamp: new Date()
    }]);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    addMessage('user', `Uploaded: ${file.name}`);
    addMessage('analyst', 'Great! Let me analyze this file...');
    setIsAnalyzing(true);

    try {
      let currentProjectId = projectId;

      // 1. Create Project if not exists
      if (!currentProjectId) {
        const projectData = {
          name: `New Project - ${new Date().toLocaleDateString()}`,
          description: 'Created via Analyst Chat'
        };
        const project = await createCMProject(projectData);
        currentProjectId = project.id;
        setProjectId(currentProjectId);
        console.log('Created project:', project);
      }

      // 2. Upload Dataset
      const dataset = await uploadDataset(currentProjectId, file);
      setDatasetId(dataset.id);
      console.log('Uploaded dataset:', dataset);

      // 3. Trigger Analysis
      const analysis = await analyzeDataset(dataset.id);
      console.log('Analysis result:', analysis);

      // 4. Show Result
      setAnalysisResult(analysis);
      const columnNames = analysis.columns?.map(col => col.variable || col.original).join(', ') || 'No columns found';
      addMessage(
        'analyst',
        `Your table contains these columns:`,
        analysis
      );
      
    } catch (error) {
      console.error('Error in file upload flow:', error);
      const errorMsg = error.response?.data?.error || error.response?.data?.detail || error.message;
      addMessage('analyst', `Error: ${errorMsg}. ${error.response?.status === 401 ? 'Please refresh the page to re-authenticate.' : ''}`);
    } finally {
      setIsAnalyzing(false);
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleConfirmMapping = async () => {
    if (!datasetId) return;

    addMessage('user', 'Looks good, proceed!');
    addMessage('analyst', 'Perfect! Ingesting your data now...');
    setIsAnalyzing(true);

    try {
      await confirmIngestion(datasetId);
      addMessage('analyst', '✅ Data ingested successfully! You can now create visualizations.');
      // Clear analysis result to hide the confirm button
      setAnalysisResult(null);
    } catch (error) {
      console.error('Error confirming ingestion:', error);
      addMessage('analyst', `Error during ingestion: ${error.response?.data?.detail || error.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    addMessage('user', input);
    setInput('');

    // Simple response logic (TODO: Replace with actual AI)
    setTimeout(() => {
      addMessage('analyst', 'I received your message. Full conversational AI is coming soon!');
    }, 500);
  };

  return (
    <div className={`analyst-chat-container ${isOpen ? '' : 'collapsed'}`}>
      {/* Toggle button */}
      <button className="chat-toggle-btn" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        {!isOpen && 'AI Analyst'}
      </button>

      <div className="chat-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h2>Jaltol Analyst</h2>
          <span className="status-badge">AI-Powered</span>
        </div>
        <button className="close-btn" onClick={() => setIsOpen(false)}>
          <X size={20} />
        </button>
      </div>

      <div className="messages-container">
        {messages.map(msg => (
          <div key={msg.id} className={`message ${msg.sender}`}>
            <div className="message-content">
              <p>{msg.text}</p>
              
              {msg.data?.columns && (
                <div className="mapping-card">
                  <h4>Detected Columns</h4>
                  <ul className="column-summary">
                    {msg.data.columns.map((col) => (
                      <li key={col.variable}>
                        <code>{col.variable}</code>
                        {col.original && col.original !== col.variable && (
                          <span className="original-label"> ({col.original})</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <span className="timestamp">{msg.timestamp.toLocaleTimeString()}</span>
          </div>
        ))}
        
        {isAnalyzing && (
          <div className="message analyst">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="input-container">
        <button className="upload-btn" onClick={() => fileInputRef.current?.click()}>
          <Upload size={18} />
          Upload CSV
        </button>
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />

        <form onSubmit={handleSendMessage} className="message-form">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            disabled={isAnalyzing}
          />
          <button type="submit" disabled={!input.trim() || isAnalyzing}>
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AnalystChat;
