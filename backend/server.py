from flask import Flask, request, jsonify
from flask_cors import CORS
from lexer import Lexer
from CFG import LL1Parser, parse_table, follow_set, cfg
from semantic import Semantic

app = Flask(__name__)
CORS(app)

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
                'syntaxTree': None,
                'semanticErrors': [],
                'semanticInfo': None,
                'activeAnalysis': None
            }), 400
        
        # Initialize result structure
        result = {
            'success': True,
            'output': '',
            'errors': [],
            'tokens': [],
            'syntaxErrors': [],
            'syntaxTree': None,
            'semanticErrors': [],
            'semanticInfo': None,
            'activeAnalysis': analysis_type
        }
        
        output_lines = []
        
        # ============================================================
        # PHASE 1: LEXICAL ANALYSIS
        # ============================================================
        print(f"\n=== LEXICAL ANALYSIS ===")
        lexer = Lexer()
        tokens, lexer_errors = lexer.lexeme(code)
        
        # Check for lexical errors
        if lexer_errors and len(lexer_errors) > 0:
            print(f"Lexical errors found: {len(lexer_errors)}")
            result['success'] = False
            result['errors'] = lexer_errors
            result['output'] = 'Running code...\n✗ Lexical analysis failed'
            result['activeAnalysis'] = 'lexical'
            
            # Format tokens even if there are errors (for debugging)
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
        
        # Format tokens for frontend display
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
        print(f"✓ Lexical analysis passed - {len(formatted_tokens)} tokens")
        
        # If only lexical analysis requested, return here
        if analysis_type == 'lexical':
            result['output'] = '\n'.join(output_lines)
            result['activeAnalysis'] = 'lexical'
            return jsonify(result)
        
        # ============================================================
        # PHASE 2: SYNTAX ANALYSIS
        # ============================================================
        print(f"\n=== SYNTAX ANALYSIS ===")
        parser = LL1Parser(cfg, parse_table, follow_set)
        parse_success, syntax_errors = parser.parse(tokens)
        
        if not parse_success:
            print(f"✗ Syntax errors found: {len(syntax_errors)}")
            for error in syntax_errors[:5]:  # Print first 5 errors
                print(f"  - {error}")
            
            result['success'] = False
            result['syntaxErrors'] = syntax_errors
            result['errors'] = syntax_errors
            output_lines.append('✗ Syntax analysis failed')
            result['output'] = '\n'.join(output_lines)
            result['activeAnalysis'] = 'syntax'
            return jsonify(result)
        
        output_lines.append('✓ Syntax analysis passed')
        print(f"✓ Syntax analysis passed")
        
        # Store parse tree information
        result['syntaxTree'] = {
            'message': 'Syntax analysis completed without errors',
            'status': 'success'
        }
        
        # If only syntax analysis requested, return here
        if analysis_type == 'syntax':
            result['output'] = '\n'.join(output_lines)
            result['activeAnalysis'] = 'syntax'
            return jsonify(result)
        
        # ============================================================
        # PHASE 3: SEMANTIC ANALYSIS
        # ============================================================
        print(f"\n=== SEMANTIC ANALYSIS ===")
        
        try:
            # Initialize semantic analyzer (no tokens in __init__)
            semantic_analyzer = Semantic()
            
            # Run semantic analysis (pass tokens here)
            semantic_errors = semantic_analyzer.semantic_analyzer(tokens)
            
            # Check if semantic analysis failed
            if semantic_errors and len(semantic_errors) > 0:
                print(f"✗ Semantic errors found: {len(semantic_errors)}")
                for error in semantic_errors[:5]:  # Print first 5 errors
                    print(f"  - {error}")
                
                result['success'] = False
                result['semanticErrors'] = semantic_errors
                result['errors'] = semantic_errors
                output_lines.append('✗ Semantic analysis failed')
                result['output'] = '\n'.join(output_lines)
                result['activeAnalysis'] = 'semantic'
                return jsonify(result)
            
            # Semantic analysis passed - format symbol table and struct table
            print(f"✓ Semantic analysis passed")
            
            # Format symbol table for JSON serialization
            formatted_symbol_table = {}
            for scope, symbols in semantic_analyzer.symbol_table.items():
                formatted_symbol_table[scope] = {}
                for var_name, symbol in symbols.items():
                    formatted_symbol_table[scope][var_name] = {
                        'name': symbol.name,
                        'symbol_type': symbol.symbol_type,
                        'data_type': symbol.data_type,
                        'value': symbol.value,
                        'is_const': symbol.is_const,
                        'line': symbol.line,
                        'column': symbol.column,
                        'dimension': symbol.dimension,
                        'sizes': symbol.sizes
                    }
            
            # Format struct table (already in the right format)
            formatted_struct_table = semantic_analyzer.struct_table
            
            # Store semantic information
            result['semanticInfo'] = {
                'symbol_table': formatted_symbol_table,
                'struct_table': formatted_struct_table
            }
            
            output_lines.append('✓ Semantic analysis passed')
            
            # Print summary
            num_symbols = sum(len(symbols) for symbols in semantic_analyzer.symbol_table.values())
            num_structs = len(semantic_analyzer.struct_table)
            print(f"  Symbols: {num_symbols} variables across {len(semantic_analyzer.symbol_table)} scopes")
            print(f"  Structs: {num_structs} definitions")
            
        except Exception as e:
            print(f"✗ Semantic analysis error: {str(e)}")
            import traceback
            traceback.print_exc()
            
            result['success'] = False
            result['semanticErrors'] = [f"Semantic analysis error: {str(e)}"]
            result['errors'] = [f"Semantic analysis error: {str(e)}"]
            output_lines.append('✗ Semantic analysis failed')
            result['output'] = '\n'.join(output_lines)
            result['activeAnalysis'] = 'semantic'
            return jsonify(result)
        
        # ============================================================
        # ALL PHASES COMPLETED SUCCESSFULLY
        # ============================================================
        result['output'] = '\n'.join(output_lines)
        result['activeAnalysis'] = 'semantic'
        result['success'] = True
        
        print(f"\n=== ANALYSIS COMPLETE ===")
        print(f"✓ All phases passed successfully")
        
        return jsonify(result)
        
    except Exception as e:
        import traceback
        print(f"\n!!! SERVER ERROR !!!")
        print(f"Error: {str(e)}")
        print(traceback.format_exc())
        
        return jsonify({
            'success': False,
            'errors': [f'Server error: {str(e)}'],
            'syntaxErrors': [],
            'semanticErrors': [],
            'tokens': [],
            'syntaxTree': None,
            'semanticInfo': None,
            'activeAnalysis': None
        }), 500

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint to verify server is running"""
    return jsonify({
        'status': 'ok',
        'message': 'Compiler server is running',
        'phases': ['lexical', 'syntax', 'semantic']
    })

if __name__ == '__main__':
    print("=" * 60)
    print("CELERITY COMPILER SERVER")
    print("=" * 60)
    print("Server starting on http://localhost:5000")
    print("Supported analysis phases:")
    print("  1. Lexical Analysis")
    print("  2. Syntax Analysis")
    print("  3. Semantic Analysis")
    print("=" * 60)
    print("\nWaiting for requests...\n")
    
    app.run(debug=True, port=5000)