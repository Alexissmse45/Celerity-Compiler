import React from 'react';

const SidePanel = ({ tokens, activeAnalysis, syntaxTree, semanticInfo, syntaxErrors }) => {
  return (
    <div className="w-96 bg-[#e8dcc8] border-2 border-[#8B7355] flex flex-col">
      {/* Analysis Header with Tabs */}
      <div className="bg-[#d4c4a8] border-b-2 border-[#8B7355]">
        <div className="flex">
          <button
            onClick={() => {}}
            className={`flex-1 px-4 py-2 font-semibold transition-colors ${
              activeAnalysis === 'lexical'
                ? 'bg-[#e8dcc8] text-gray-800 border-b-2 border-[#8B7355]'
                : 'bg-[#c4b5a0] text-gray-600 hover:bg-[#d4c4a8]'
            }`}
          >
            Lexical
          </button>
          <button
            onClick={() => {}}
            className={`flex-1 px-4 py-2 font-semibold transition-colors ${
              activeAnalysis === 'syntax'
                ? 'bg-[#e8dcc8] text-gray-800 border-b-2 border-[#8B7355]'
                : 'bg-[#c4b5a0] text-gray-600 hover:bg-[#d4c4a8]'
            }`}
          >
            Syntax
          </button>
          <button
            onClick={() => {}}
            className={`flex-1 px-4 py-2 font-semibold transition-colors ${
              activeAnalysis === 'semantic'
                ? 'bg-[#e8dcc8] text-gray-800 border-b-2 border-[#8B7355]'
                : 'bg-[#c4b5a0] text-gray-600 hover:bg-[#d4c4a8]'
            }`}
          >
            Semantic
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto">
        {/* LEXICAL ANALYSIS - Token Table */}
        {activeAnalysis === 'lexical' && (
          <div className="h-full">
            {tokens && tokens.length > 0 ? (
              <table className="w-full text-sm border-collapse">
                <thead className="sticky top-0 bg-[#c4a57b]">
                  <tr>
                    <th className="border border-[#8B7355] px-2 py-2 text-left font-semibold">#</th>
                    <th className="border border-[#8B7355] px-2 py-2 text-left font-semibold">Lexeme</th>
                    <th className="border border-[#8B7355] px-2 py-2 text-left font-semibold">Token</th>
                    <th className="border border-[#8B7355] px-2 py-2 text-left font-semibold">Line</th>
                    <th className="border border-[#8B7355] px-2 py-2 text-left font-semibold">Column</th>
                  </tr>
                </thead>
                <tbody>
                  {tokens.map((token, index) => (
                    <tr key={index} className="hover:bg-[#d4c4a8]">
                      <td className="border border-[#8B7355] px-2 py-1 text-gray-700">{index + 1}</td>
                      <td className="border border-[#8B7355] px-2 py-1 text-gray-700 font-mono">{token.lexeme}</td>
                      <td className="border border-[#8B7355] px-2 py-1 text-gray-700">{token.token}</td>
                      <td className="border border-[#8B7355] px-2 py-1 text-gray-700">{token.line}</td>
                      <td className="border border-[#8B7355] px-2 py-1 text-gray-700">{token.column}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex items-center justify-center h-full p-4">
                <div className="text-center text-gray-600">
                  <p className="font-semibold mb-2">No Tokens</p>
                  <p className="text-sm">Run lexical analysis to see tokens</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SYNTAX ANALYSIS - Parse Tree or Errors */}
        {activeAnalysis === 'syntax' && (
          <div className="p-4">
            {syntaxErrors && syntaxErrors.length > 0 ? (
              <div className="text-gray-700">
                <p className="font-semibold mb-3 text-red-600">Syntax Errors:</p>
                <div className="bg-white p-3 rounded border border-red-400 max-h-96 overflow-auto">
                  {syntaxErrors.map((error, index) => (
                    <div key={index} className="text-red-600 mb-2 text-sm">
                      {error}
                    </div>
                  ))}
                </div>
              </div>
            ) : syntaxTree ? (
              <div className="text-gray-700">
                <p className="font-semibold mb-2">Parse Tree:</p>
                <pre className="bg-white p-3 rounded border border-[#8B7355] text-xs overflow-auto max-h-96">
                  {JSON.stringify(syntaxTree, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-600">
                  <p className="font-semibold mb-2">Syntax Analysis</p>
                  <p className="text-sm">Parse tree will appear here after syntax analysis</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SEMANTIC ANALYSIS - Coming Soon */}
        {activeAnalysis === 'semantic' && (
          <div className="flex items-center justify-center h-full p-4">
            <div className="text-center">
              <p className="text-gray-700 font-semibold text-lg mb-2">Coming Soon...</p>
              <p className="text-gray-600 text-sm">Semantic analysis is under development</p>
            </div>
          </div>
        )}

        {/* DEFAULT - No Analysis Selected */}
        {!activeAnalysis && (
          <div className="flex items-center justify-center h-full p-4">
            <div className="text-center text-gray-600 text-sm">
              <p>Click Run to start analysis</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SidePanel;