import os
import json
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from database import get_db

profile_bp = Blueprint('profile', __name__)

@profile_bp.route('/profile', methods=['POST'])
def save_profile():
    try:
        # Extract fields from multipart/form-data
        email = request.form.get("email")
        if not email:
            return jsonify({"message": "User email is required"}), 400

        connection_types_raw = request.form.get("connectionTypes")
        min_age = request.form.get("minAge")
        max_age = request.form.get("maxAge")
        self_summary = request.form.get("selfSummary")

        # Parse questionnaire answers dynamically from fields starting with 'q'
        questionnaire = {}
        for key in request.form.keys():
            if key.startswith("q") and "_" in key:
                questionnaire[key] = request.form.get(key)

        db = get_db()
        
        # Verify that the user exists in our users collection
        if not db.users.find_one({"email": email}):
            return jsonify({"message": f"User with email {email} does not exist"}), 400

        # Save uploaded photos files
        saved_photos = []
        for file_key in request.files:
            file = request.files[file_key]
            if file and file.filename:
                clean_name = secure_filename(file.filename)
                safe_email_prefix = email.replace('@', '_').replace('.', '_')
                unique_filename = f"{safe_email_prefix}_{clean_name}"
                
                filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], unique_filename)
                file.save(filepath)
                saved_photos.append(unique_filename)

        connection_types = []
        if connection_types_raw:
            try:
                connection_types = json.loads(connection_types_raw)
            except Exception:
                connection_types = [connection_types_raw]

        # Construct MongoDB document representation
        profile_doc = {
            "email": email,
            "connection_types": connection_types,
            "min_age": int(min_age) if min_age else None,
            "max_age": int(max_age) if max_age else None,
            "photos": saved_photos,
            "self_summary": self_summary,
            "questionnaire": questionnaire
        }

        # Update or insert using upsert
        db.profiles.update_one(
            {"email": email},
            {"$set": profile_doc},
            upsert=True
        )

        print(f"[SUCCESS] MongoDB Onboarding profile saved for: {email}")
        return jsonify({
            "message": "Profile saved successfully!",
            "photos": saved_photos
        }), 200

    except Exception as e:
        print(f"[ERROR] {e}")
        return jsonify({"message": f"An internal server error occurred: {str(e)}"}), 500
