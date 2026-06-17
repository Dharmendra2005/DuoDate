from flask import Blueprint, request, jsonify
from database import get_db

login_bp = Blueprint('login', __name__)

@login_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"message": "Invalid request body"}), 400

        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return jsonify({"message": "Email and password are required"}), 400

        db = get_db()
        user = db.users.find_one({"email": email})

        # Basic verification
        if not user or user.get("password") != password:
            return jsonify({"message": "Invalid email or password"}), 401

        # Check if the user has an onboarded profile
        has_profile = db.profiles.find_one({"email": email}) is not None

        print(f"[SUCCESS] MongoDB User logged in: {email}")
        return jsonify({
            "message": "Login successful!",
            "user": {
                "name": user.get("name"),
                "email": email,
                "hasProfile": has_profile
            }
        }), 200

    except Exception as e:
        print(f"[ERROR] {e}")
        return jsonify({"message": f"An internal server error occurred: {str(e)}"}), 500
