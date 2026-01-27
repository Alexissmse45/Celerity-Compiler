import React, { useState } from 'react';
import Header from './components/header';
import Editor from './components/editor';
import SidePanel from './components/sidepanel';
import Terminal from './components/terminal';

function App() {
  const [code, setCode] = useState(`main(){\n  #Welcome To Celerity Compiler!\n}`);
  const [activeTab, setActiveTab] = useState('terminal');
  const [output, setOutput] = useState('');
  const [errors, setErrors] = useState([]);
  const [tokens, setTokens] = useState([]);
  const [activeAnalysis, setActiveAnalysis] = useState(null);

  const handleRun = async (analysisType) => {
    setActiveTab('terminal');
    setErrors([]);
    setTokens([]);

    try {
      const response = await fetch('http://localhost:5000/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          code: code,
          analysisType: analysisType 
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        let outputMessages = ['<b>Running code...</b><br>'];
        
        // Set which analysis tab to show based on backend response
        setActiveAnalysis(data.activeAnalysis);
        
        // Always show tokens if available
        if (data.tokens && data.tokens.length > 0) {
          setTokens(data.tokens);
        }
        
        // Parse output from backend
        const outputLines = data.output.split('\n');
        outputLines.forEach(line => {
          if (line.includes('✓')) {
            outputMessages.push(`<span style="color: green;">${line}</span><br>`);
          } else if (line.includes('✗')) {
            outputMessages.push(`<span style="color: red;">${line}</span><br>`);
          } else {
            outputMessages.push(`${line}<br>`);
          }
        });
        
        setOutput(outputMessages.join(''));
        
        // Handle errors
        if (data.errors && data.errors.length > 0) {
          setErrors(data.errors);
        }
        
      } else {
        setErrors(data.errors || ['Analysis failed']);
        setOutput('<span style="color: red;">Analysis failed. See errors below.</span>');
        setActiveAnalysis(data.activeAnalysis);
        
        // Still show tokens if available
        if (data.tokens && data.tokens.length > 0) {
          setTokens(data.tokens);
        }
      }
    } catch (error) {
      setErrors([`Connection error: ${error.message}`]);
      setOutput('<span style="color: red;">Failed to connect to backend. Make sure Flask server is running on port 5000.</span>');
      setActiveAnalysis(null);
    }
  };

  const handleStop = () => {
    setOutput('');
    setErrors([]);
    setTokens([]);
    setActiveAnalysis(null);
  };

  const handleAnalysisClick = (type) => {
    handleRun(type);
  };

  return (
    <div className="w-screen h-screen flex flex-col bg-[#DFC7A8] overflow-hidden">
      <Header />
      
      <div className="flex-1 flex flex-col p-4 gap-2 min-h-0">
        {/* Top section: Editor and Side Panel */}
        <div className="flex-1 flex gap-3 min-h-0">
          <Editor 
            code={code}
            setCode={setCode}
            onRun={handleRun}
            onStop={handleStop}
          />
          <SidePanel 
            tokens={tokens}
            activeAnalysis={activeAnalysis}
            onAnalysisClick={handleAnalysisClick}
          />
        </div>
        
        {/* Bottom section: Terminal */}
        <Terminal 
          output={output}
          errors={errors}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </div>
    </div>
  );
}

export default App;