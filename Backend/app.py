import os
from flask import Flask, send_from_directory
from flask_cors import CORS
from config import Config

# Import Blueprints
from routes.signup import signup_bp
from routes.login import login_bp
from routes.profile import profile_bp
from routes.duo import duo_bp

app = Flask(__name__)
app.config.from_object(Config)

# Enable CORS for frontend communication
CORS(app)

# Ensure upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

@app.route('/uploads/<filename>')
def serve_upload(filename):
    """Exposes uploaded profile photos as static files"""
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# Register Blueprint routes
app.register_blueprint(signup_bp)
app.register_blueprint(login_bp)
app.register_blueprint(profile_bp)
app.register_blueprint(duo_bp)

if __name__ == '__main__':
    print(f"Starting DuoDate Python backend on http://localhost:{Config.PORT}...")
    
    # Verify/establish database connection on startup
    from database import get_db
    try:
        get_db()
    except Exception as e:
        print(f"[WARNING] Could not connect to MongoDB Atlas at startup: {e}")
        print("Please verify your internet connection and MONGO_URI in your .env file.")

    app.run(host='0.0.0.0', port=Config.PORT, debug=True)
