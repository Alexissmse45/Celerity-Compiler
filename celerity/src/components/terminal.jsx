import React from 'react';

const Terminal = ({ output, errors, activeTab, setActiveTab }) => {
  return (
    <div className="flex flex-col" style={{ height: '240px' }}>
      {/* Terminal Tabs */}
      <div className="flex gap-1 mb-0">
        <button
          onClick={() => setActiveTab('terminal')}
          className={`px-5 py-2 border-2 border-[#8B7355] transition-colors ${
            activeTab === 'terminal'
              ? 'bg-[#C8B5A0] text-[#333] border-b-0 rounded-t'
              : 'bg-[#E8DCC8] text-[#333] hover:bg-[#D4C4B0] rounded-t'
          }`}
        >
          Terminal
        </button>
        <button
          onClick={() => setActiveTab('generate')}
          className={`px-5 py-2 border-2 border-[#8B7355] transition-colors ${
            activeTab === 'generate'
              ? 'bg-[#C8B5A0] text-[#333] border-b-0 rounded-t'
              : 'bg-[#E8DCC8] text-[#333] hover:bg-[#D4C4B0] rounded-t'
          }`}
        >
          Generate Code
        </button>
      </div>

      {/* Terminal Content */}
      <div className="flex-1 bg-[#E8DCC8] border-2 border-[#8B7355] text-[#333] p-3 overflow-auto" style={{ 
        fontFamily: 'Consolas, monospace',
        fontSize: '9pt'
      }}>
        {activeTab === 'terminal' ? (
          <div>
            {/* Output Messages */}
            {output && <div dangerouslySetInnerHTML={{ __html: output }} />}
            
            {/* Error Messages */}
            {errors && errors.length > 0 && (
              <div style={{ marginTop: '12px' }}>
                <div style={{ fontWeight: 'bold', color: '#DC3545', marginBottom: '6px' }}>
                  ⚠️ Errors:
                </div>
                {errors.map((error, index) => (
                  <div key={index} style={{ color: '#DC3545', marginBottom: '4px' }}>
                    {error}
                  </div>
                ))}
              </div>
            )}
            
            {/* Default Message */}
            {!output && (!errors || errors.length === 0) && (
              <span style={{ color: '#666' }}>Terminal cleared. Click 'Run' to execute code.</span>
            )}
          </div>
        ) : (
          <div style={{ color: '#666' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Generated Code:</div>
            <div># Three-address code generation coming soon...</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Terminal;