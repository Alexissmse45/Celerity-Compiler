from flask import Flask, request, jsonify
from flask_cors import CORS
from lexer import Lexer
from CFG import LL1Parser, parse_table, follow_set, cfg

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

@app.route('/analyze', methods=['POST'])
def analyze():
    try:
        data = request.json
        code = data.get('code', '')
        analysis_type = data.get('analysisType', 'all')
        
        if not code:
            return jsonify({
                'success': False,
                'output': 'No code provided',
                'errors': ['No code provided'],
                'tokens': [],
                'syntaxErrors': [],
                'activeAnalysis': None
            }), 400
        
        result = {
            'success': True,
            'output': '',
            'errors': [],
            'tokens': [],
            'syntaxErrors': [],
            'syntaxTree': None,
            'activeAnalysis': analysis_type
        }
        
        output_lines = []
        
        # LEXICAL ANALYSIS
        print(f"Running lexical analysis...")
        lexer = Lexer()
        tokens, lexer_errors = lexer.lexeme(code)
        
        if lexer_errors and len(lexer_errors) > 0:
            result['success'] = False
            result['errors'] = lexer_errors
            result['output'] = 'Running code...\n✗ Lexical analysis failed'
            result['activeAnalysis'] = 'lexical'
            
            # Still format tokens even if there are errors
            formatted_tokens = []
            for token in tokens:
                formatted_tokens.append({
                    'lexeme': token[0],
                    'token': token[1],
                    'line': token[2],
                    'column': token[3]
                })
            result['tokens'] = formatted_tokens
            
            return jsonify(result)
        
        # Format tokens for frontend
        formatted_tokens = []
        for token in tokens:
            formatted_tokens.append({
                'lexeme': token[0],
                'token': token[1],
                'line': token[2],
                'column': token[3]
            })
        
        result['tokens'] = formatted_tokens
        output_lines.append('Running code...')
        output_lines.append('✓ Lexical analysis passed')
        
        # If only lexical analysis requested
        if analysis_type == 'lexical':
            result['output'] = '\n'.join(output_lines)
            result['activeAnalysis'] = 'lexical'
            return jsonify(result)
        
        # SYNTAX ANALYSIS
        print(f"Running syntax analysis...")
        parser = LL1Parser(cfg, parse_table, follow_set)
        parse_success, syntax_errors = parser.parse(tokens)
        
        if not parse_success:
            result['success'] = False
            result['syntaxErrors'] = syntax_errors
            result['errors'] = syntax_errors  # Also show in terminal
            output_lines.append('✗ Syntax analysis failed')
            result['output'] = '\n'.join(output_lines)
            result['activeAnalysis'] = 'syntax'
            return jsonify(result)
        
        output_lines.append('✓ Syntax analysis passed')
        result['syntaxTree'] = {'message': 'Parse tree data here'}
        result['output'] = '\n'.join(output_lines)
        result['activeAnalysis'] = 'syntax'
        
        return jsonify(result)
        
    except Exception as e:
        import traceback
        print(f"Server error: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            'success': False,
            'errors': [f'Server error: {str(e)}'],
            'syntaxErrors': [],
            'tokens': [],
            'activeAnalysis': None
        }), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})

if __name__ == '__main__':
    app.run(debug=True, port=5000)