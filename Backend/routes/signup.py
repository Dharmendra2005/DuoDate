from flask import Blueprint, request, jsonify
from database import get_db

signup_bp = Blueprint('signup', __name__)

@signup_bp.route('/signup', methods=['POST'])
def signup():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"message": "Invalid request body"}), 400

        email = data.get("email")
        password = data.get("password")
        name = data.get("name")
        location = data.get("location")
        gender = data.get("gender")
        birth_date = data.get("birthDate")

        if not email or not password:
            return jsonify({"message": "Email and password are required"}), 400

        if len(password) < 8:
            return jsonify({"message": "Password must be at least 8 characters long"}), 400

        db = get_db()
        
        # Check if user already exists
        if db.users.find_one({"email": email}):
            return jsonify({"message": "A user with this email already exists"}), 400

        # Insert user document into MongoDB
        user_doc = {
            "email": email,
            "name": name,
            "location": location,
            "gender": gender,
            "birth_date": birth_date,
            "password": password  # In production, hash this!
        }
        db.users.insert_one(user_doc)

        print(f"[SUCCESS] MongoDB User signed up: {email}")
        return jsonify({
            "message": "Signup successful!",
            "user": {
                "name": name,
                "email": email
            }
        }), 201

    except Exception as e:
        print(f"[ERROR] {e}")
        return jsonify({"message": f"An internal server error occurred: {str(e)}"}), 500
