from flask import Flask, request, jsonify
from flask_cors import CORS
import pdfplumber
import os
import tempfile

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return jsonify({
        'message': 'PDF Extraction API is running!',
        'endpoints': {
            'POST /extract-pdf-url': 'Extract text from PDF by URL',
            'POST /extract-pdf': 'Extract text from uploaded PDF file'
        }
    })

@app.route('/extract-pdf', methods=['POST'])
def extract_pdf():
    try:
        # Check if a file was uploaded
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not file.filename.lower().endswith('.pdf'):
            return jsonify({'error': 'File must be a PDF'}), 400
        
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_file:
            file.save(temp_file.name)
            temp_path = temp_file.name
        
        try:
            # Extract text using pdfplumber
            extracted_text = ""
            with pdfplumber.open(temp_path) as pdf:
                for page_num, page in enumerate(pdf.pages, 1):
                    text = page.extract_text()
                    if text:
                        extracted_text += f"--- Page {page_num} ---\n"
                        extracted_text += text + "\n\n"
            
            # Clean up temporary file
            os.unlink(temp_path)
            
            return jsonify({
                'success': True,
                'text': extracted_text,
                'pages': len(pdf.pages)
            })
        
        except Exception as e:
            # Clean up temporary file in case of error
            if os.path.exists(temp_path):
                os.unlink(temp_path)
            return jsonify({'error': f'Error processing PDF: {str(e)}'}), 500
    
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@app.route('/extract-pdf-url', methods=['POST'])
def extract_pdf_from_url():
    try:
        data = request.get_json()
        
        if not data or 'url' not in data:
            return jsonify({'error': 'No URL provided'}), 400
        
        pdf_url = data['url']
        
        # For local files served from Next.js public folder
        if pdf_url.startswith('/'):
            # Get the absolute path to the public folder
            current_dir = os.path.dirname(os.path.abspath(__file__))
            pdf_path = os.path.join(current_dir, "..", "public", pdf_url.lstrip('/'))
            
            if not os.path.exists(pdf_path):
                return jsonify({'error': 'PDF file not found'}), 404
            
            # Extract text using pdfplumber
            extracted_text = ""
            with pdfplumber.open(pdf_path) as pdf:
                for page_num, page in enumerate(pdf.pages, 1):
                    text = page.extract_text()
                    if text:
                        extracted_text += f"--- Page {page_num} ---\n"
                        extracted_text += text + "\n\n"
            
            return jsonify({
                'success': True,
                'text': extracted_text,
                'pages': len(pdf.pages)
            })
        else:
            return jsonify({'error': 'Only local PDFs are supported in this example'}), 400
    
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001) 