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

CORS(app)

os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

@app.route("/")
def home():
    return {
        "status": "success",
        "message": "DuoDate Backend is Running 🚀"
    }, 200


@app.route("/uploads/<path:filename>")
def serve_upload(filename):
    return send_from_directory(app.config["UPLOAD_FOLDER"], filename)

app.register_blueprint(signup_bp)
app.register_blueprint(login_bp)
app.register_blueprint(profile_bp)
app.register_blueprint(duo_bp)


if __name__ == "__main__":

    from database import get_db

    try:
        get_db()
        print("MongoDB Connected Successfully")
    except Exception as e:
        print(f"MongoDB Connection Error: {e}")

    # Render provides PORT as an environment variable
    port = int(os.environ.get("PORT", 5000))

    print(f"DuoDate Backend running on port {port}")

    app.run(
        host="0.0.0.0",
        port=port,
        debug=False
    )