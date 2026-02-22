import React, { useState } from 'react';
import Header from './components/header';
import Editor from './components/editor';
import SidePanel from './components/sidepanel';
import Terminal from './components/terminal';

function App() {
  const [code, setCode] = useState(`main(){\n  #Welcome To Celerity Compiler!\n} \n`);
  const [activeTab, setActiveTab] = useState('terminal');
  const [output, setOutput] = useState('');
  const [errors, setErrors] = useState([]);
  const [tokens, setTokens] = useState([]);
  const [syntaxErrors, setSyntaxErrors] = useState([]);
  const [syntaxTree, setSyntaxTree] = useState(null);
  const [semanticErrors, setSemanticErrors] = useState([]);
  const [semanticInfo, setSemanticInfo] = useState(null);
  const [activeAnalysis, setActiveAnalysis] = useState(null);

  const handleTabSwitch = (tabName) => {
    setActiveAnalysis(tabName);
  };

  const handleRun = async (analysisType) => {
    setActiveTab('terminal');
    setErrors([]);
    setTokens([]);
    setSyntaxErrors([]);
    setSyntaxTree(null);
    setSemanticErrors([]);
    setSemanticInfo(null);

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
      
      console.log('Backend response:', data); // Debug log
      
      if (data.success) {
        let outputMessages = [''];
        
        setActiveAnalysis(data.activeAnalysis);
        
        // Set tokens from lexical analysis
        if (data.tokens && data.tokens.length > 0) {
          setTokens(data.tokens);
        }

        // Set syntax tree if syntax passed
        if (data.syntaxTree) {
          setSyntaxTree(data.syntaxTree);
        }

        // Set semantic info if semantic passed
        if (data.semanticInfo) {
          setSemanticInfo(data.semanticInfo);
        }
        
        // Build output messages with checkmarks
        const outputLines = data.output.split('\n');
        outputLines.forEach(line => {
          if (line.includes('✓')) {
            outputMessages.push(`<span style="color: green;">${line}</span><br>`);
          } else if (line.includes('✗') || line.includes('X')) {
            outputMessages.push(`<span style="color: red;">${line}</span><br>`);
          } else {
            outputMessages.push(`${line}<br>`);
          }
        });
        
        setOutput(outputMessages.join(''));
        
        // Set general errors if any
        if (data.errors && data.errors.length > 0) {
          setErrors(data.errors);
        }

        // Set syntax errors if any
        if (data.syntaxErrors && data.syntaxErrors.length > 0) {
          setSyntaxErrors(data.syntaxErrors);
        }

        // Set semantic errors if any
        if (data.semanticErrors && data.semanticErrors.length > 0) {
          setSemanticErrors(data.semanticErrors);
        }
        
      } else {
        // FAILED CASE
        let outputMessages = ['<b>Running code...</b><br>'];
        
        if (data.activeAnalysis === 'lexical') {
          outputMessages.push('<span style="color: red;">X Lexical analysis failed</span><br>');
        } else if (data.activeAnalysis === 'syntax') {
          outputMessages.push('<span style="color: green;">✓ Lexical analysis passed</span><br>');
          outputMessages.push('<span style="color: red;">X Syntax analysis failed</span><br>');
        } else if (data.activeAnalysis === 'semantic') {
          outputMessages.push('<span style="color: green;">✓ Lexical analysis passed</span><br>');
          outputMessages.push('<span style="color: green;">✓ Syntax analysis passed</span><br>');
          outputMessages.push('<span style="color: red;">X Semantic analysis failed</span><br>');
        }
        
        setOutput(outputMessages.join(''));
        setErrors(data.errors || ['Analysis failed']);
        setActiveAnalysis(data.activeAnalysis);
        
        // Set tokens even on failure (if lexical passed)
        if (data.tokens && data.tokens.length > 0) {
          setTokens(data.tokens);
        }

        // Set syntax tree even if semantic failed (if syntax passed)
        if (data.syntaxTree) {
          setSyntaxTree(data.syntaxTree);
        }

        // Set syntax errors if present
        if (data.syntaxErrors && data.syntaxErrors.length > 0) {
          console.log('Setting syntax errors:', data.syntaxErrors); // Debug
          setSyntaxErrors(data.syntaxErrors);
        }

        // Set semantic errors if present
        if (data.semanticErrors && data.semanticErrors.length > 0) {
          console.log('Setting semantic errors:', data.semanticErrors); // Debug
          setSemanticErrors(data.semanticErrors);
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
    setSyntaxErrors([]);
    setSyntaxTree(null);
    setSemanticErrors([]);
    setSemanticInfo(null);
    setActiveAnalysis(null);
  };

  const handleAnalysisClick = (type) => {
    handleRun(type);
  };

  return (
    <div className="w-screen h-screen flex flex-col bg-[#DFC7A8] overflow-hidden">
      <Header />
      
      <div className="flex-1 flex flex-col p-4 gap-2 min-h-0">
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
            syntaxErrors={syntaxErrors}
            syntaxTree={syntaxTree}
            semanticErrors={semanticErrors}
            semanticInfo={semanticInfo}
            onAnalysisClick={handleAnalysisClick}
            onTabSwitch={handleTabSwitch}
          />
        </div>
        
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