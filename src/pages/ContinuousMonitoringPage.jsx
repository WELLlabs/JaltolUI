import React from 'react';
import AnalystChat from '../components/AnalystChat';

const ContinuousMonitoringPage = () => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
      padding: '40px 20px'
    }}>
      <AnalystChat />
    </div>
  );
};

export default ContinuousMonitoringPage;
