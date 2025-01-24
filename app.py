from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from utils.links import Links  # Ensure this import is correct
import logging
from logging.handlers import RotatingFileHandler
import os
import asyncio
from urllib.parse import quote

app = Flask(__name__)

# Middleware
CORS(app)  # Enable CORS

# Security headers
@app.after_request
def add_security_headers(response):
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'SAMEORIGIN'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    return response

# Rate limiting
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["100 per 15 minutes"]
)

# Logging
handler = RotatingFileHandler('app.log', maxBytes=10000, backupCount=3)
handler.setLevel(logging.INFO)
app.logger.addHandler(handler)
logging.getLogger('werkzeug').addHandler(handler)

links = Links()

# Routes
@app.route('/scrape', methods=['GET'])
@limiter.limit("100 per 15 minutes")
def scrape():
    input_url = request.args.get('url')

    if not input_url:
        return jsonify({"error": "URL is required"}), 400

    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        data = loop.run_until_complete(links.is_link_valid(input_url))
        return jsonify(data), 200
    except Exception as error:
        app.logger.error(f"Error during scraping: {error}")
        return jsonify({"error": str(error)}), 500

# Error Handling
@app.errorhandler(500)
def internal_server_error(error):
    app.logger.error(f"Server error: {error}")
    return jsonify({"error": "Something went wrong!"}), 500

# Start Server
if __name__ == '__main__':
    port = int(os.getenv('PORT', 3000))
    app.run(host='0.0.0.0', port=port)