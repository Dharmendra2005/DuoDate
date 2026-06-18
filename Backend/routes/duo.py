from flask import Blueprint, request, jsonify
from bson.objectid import ObjectId
from database import get_db
from datetime import datetime

duo_bp = Blueprint('duo', __name__)

def calculate_age(birth_date_str):
    """Calculates age from birth date string YYYY-MM-DD"""
    if not birth_date_str:
        return 22
    try:
        birth_date = datetime.strptime(birth_date_str, "%Y-%m-%d")
        today = datetime.today()
        return today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
    except Exception:
        return 22

@duo_bp.route('/api/users/search', methods=['GET'])
def search_users():
    try:
        query_str = request.args.get("q", "")
        caller_email = request.args.get("email", "")
        
        if not query_str:
            return jsonify({"users": []}), 200

        db = get_db()
        
        # Get users matching query in email or name
        match_query = {
            "$and": [
                {"email": {"$ne": caller_email}},
                {
                    "$or": [
                        {"email": {"$regex": query_str, "$options": "i"}},
                        {"name": {"$regex": query_str, "$options": "i"}}
                    ]
                }
            ]
        }
        
        users = list(db.users.find(match_query))
        
        # Check who is already in a duo
        all_duos = list(db.duos.find())
        duo_emails = set()
        for d in all_duos:
            for m in d.get("members", []):
                duo_emails.add(m)
                
        results = []
        for u in users:
            email = u["email"]
            # Filter out users already in a duo
            if email in duo_emails:
                continue
                
            profile = db.profiles.find_one({"email": email})
            photos = profile.get("photos", []) if profile else []
            
            results.append({
                "email": email,
                "name": u.get("name", ""),
                "gender": u.get("gender", ""),
                "photo": photos[0] if photos else None
            })
            
        return jsonify({"users": results}), 200
    except Exception as e:
        print(f"[ERROR search_users] {e}")
        return jsonify({"message": str(e)}), 500

@duo_bp.route('/api/duo/status', methods=['GET'])
def duo_status():
    try:
        email = request.args.get("email", "")
        if not email:
            return jsonify({"message": "Email is required"}), 400
            
        db = get_db()
        
        # Prepare current user's profile data
        me_user = db.users.find_one({"email": email})
        me_profile = db.profiles.find_one({"email": email})
        me_data = {
            "email": email,
            "name": me_user.get("name") if me_user else "",
            "age": calculate_age(me_user.get("birth_date") if me_user else None),
            "bio": me_profile.get("self_summary", "") if me_profile else "",
            "photos": me_profile.get("photos") if me_profile else []
        } if (me_user or me_profile) else None

        # 1. Check if in active duo
        my_duo = db.duos.find_one({"members": email}, sort=[("created_at", -1)])
        if my_duo:
            partner_email = [m for m in my_duo["members"] if m != email][0]
            
            partner_user = db.users.find_one({"email": partner_email})
            partner_profile = db.profiles.find_one({"email": partner_email})
            
            return jsonify({
                "status": "in_duo",
                "duo_id": str(my_duo["_id"]),
                "me": me_data,
                "partner": {
                    "email": partner_email,
                    "name": partner_user.get("name") if partner_user else "",
                    "age": calculate_age(partner_user.get("birth_date") if partner_user else None),
                    "bio": partner_profile.get("self_summary", "") if partner_profile else "",
                    "photos": partner_profile.get("photos") if partner_profile else []
                }
            }), 200
            
        # 2. Check for pending received invites
        received = db.duo_invites.find_one({"receiver_email": email, "status": "pending"})
        if received:
            sender_email = received["sender_email"]
            sender_user = db.users.find_one({"email": sender_email})
            sender_profile = db.profiles.find_one({"email": sender_email})
            
            return jsonify({
                "status": "invite_received",
                "me": me_data,
                "invite": {
                    "id": str(received["_id"]),
                    "sender": {
                        "email": sender_email,
                        "name": sender_user.get("name") if sender_user else "",
                        "photos": sender_profile.get("photos") if sender_profile else []
                    }
                }
            }), 200
            
        # 3. Check for pending sent invites
        sent = db.duo_invites.find_one({"sender_email": email, "status": "pending"})
        if sent:
            receiver_email = sent["receiver_email"]
            receiver_user = db.users.find_one({"email": receiver_email})
            
            return jsonify({
                "status": "invite_sent",
                "me": me_data,
                "invite": {
                    "id": str(sent["_id"]),
                    "receiver": {
                        "email": receiver_email,
                        "name": receiver_user.get("name") if receiver_user else ""
                    }
                }
            }), 200
            
        return jsonify({
            "status": "solo",
            "me": me_data
        }), 200
    except Exception as e:
        print(f"[ERROR duo_status] {e}")
        return jsonify({"message": str(e)}), 500

@duo_bp.route('/api/duo/invite', methods=['POST'])
def send_invite():
    try:
        data = request.get_json()
        sender_email = data.get("senderEmail")
        receiver_email = data.get("receiverEmail")
        
        if not sender_email or not receiver_email:
            return jsonify({"message": "Sender and receiver emails are required"}), 400
            
        db = get_db()
        
        # Ensure target exists
        receiver = db.users.find_one({"email": receiver_email})
        if not receiver:
            return jsonify({"message": "User not found"}), 404
            
        # Ensure sender is not already in a duo
        if db.duos.find_one({"members": sender_email}):
            return jsonify({"message": "You are already in a Duo!"}), 400
            
        # Ensure receiver is not already in a duo
        if db.duos.find_one({"members": receiver_email}):
            return jsonify({"message": "Target user is already in a Duo!"}), 400
            
        # Create or update invite to pending
        db.duo_invites.update_one(
            {"sender_email": sender_email, "receiver_email": receiver_email},
            {"$set": {"status": "pending", "timestamp": datetime.now()}},
            upsert=True
        )
        
        return jsonify({"message": "Invitation sent successfully!"}), 200
    except Exception as e:
        print(f"[ERROR send_invite] {e}")
        return jsonify({"message": str(e)}), 500

@duo_bp.route('/api/duo/accept', methods=['POST'])
def accept_invite():
    try:
        data = request.get_json()
        sender_email = data.get("senderEmail")
        receiver_email = data.get("receiverEmail")
        
        if not sender_email or not receiver_email:
            return jsonify({"message": "Sender and receiver emails are required"}), 400
            
        db = get_db()
        
        # Mark all pending invites for both users as invalid
        db.duo_invites.update_many(
            {"$or": [
                {"sender_email": sender_email},
                {"receiver_email": sender_email},
                {"sender_email": receiver_email},
                {"receiver_email": receiver_email}
            ]},
            {"$set": {"status": "resolved"}}
        )
        
        # Mark this specific invite as accepted
        db.duo_invites.update_one(
            {"sender_email": sender_email, "receiver_email": receiver_email},
            {"$set": {"status": "accepted"}}
        )
        
        # Genders
        u1 = db.users.find_one({"email": sender_email})
        u2 = db.users.find_one({"email": receiver_email})
        g1 = u1.get("gender", "male") if u1 else "male"
        g2 = u2.get("gender", "male") if u2 else "male"
        
        gender = "mixed"
        if g1 == "male" and g2 == "male":
            gender = "male"
        elif g1 == "female" and g2 == "female":
            gender = "female"
            
        db.duos.insert_one({
            "members": sorted([sender_email, receiver_email]),
            "gender": gender,
            "created_at": datetime.now()
        })
        
        return jsonify({"message": "Invitation accepted! Duo created."}), 200
    except Exception as e:
        print(f"[ERROR accept_invite] {e}")
        return jsonify({"message": str(e)}), 500

@duo_bp.route('/api/duo/reject', methods=['POST'])
def reject_invite():
    try:
        data = request.get_json()
        sender_email = data.get("senderEmail")
        receiver_email = data.get("receiverEmail")
        
        if not sender_email or not receiver_email:
            return jsonify({"message": "Sender and receiver emails are required"}), 400
            
        db = get_db()
        db.duo_invites.update_one(
            {"sender_email": sender_email, "receiver_email": receiver_email, "status": "pending"},
            {"$set": {"status": "rejected"}}
        )
        return jsonify({"message": "Invitation rejected/cancelled successfully."}), 200
    except Exception as e:
        print(f"[ERROR reject_invite] {e}")
        return jsonify({"message": str(e)}), 500

@duo_bp.route('/api/duo/discover', methods=['GET'])
def discover_duos():
    try:
        email = request.args.get("email", "")
        if not email:
            return jsonify({"message": "Email is required"}), 400
            
        db = get_db()
        my_duo = db.duos.find_one({"members": email}, sort=[("created_at", -1)])
        if not my_duo:
            return jsonify({"message": "You must be in a duo to swipe", "duos": []}), 400
            
        my_duo_id = str(my_duo["_id"])
        my_gender = my_duo.get("gender", "male")
        
        # Determine opposite gender
        target_gender = "female" if my_gender == "male" else ("male" if my_gender == "female" else None)
        
        # Query matching gender and not containing current user
        discover_query = {"members": {"$ne": email}}
        if target_gender:
            discover_query["gender"] = target_gender
            
        all_other_duos = list(db.duos.find(discover_query))
        
        # Get likes already cast by this active duo (only filter out liked duos, not passed ones)
        duo_likes = list(db.swipes.find({"swiper_duo_id": my_duo_id, "action": "like"}))
        liked_duo_ids = {s["target_duo_id"] for s in duo_likes}
        
        results = []
        for d in all_other_duos:
            duo_id = str(d["_id"])
            if duo_id in liked_duo_ids:
                continue
                
            members_data = []
            for mem_email in d["members"]:
                u = db.users.find_one({"email": mem_email})
                p = db.profiles.find_one({"email": mem_email})
                members_data.append({
                    "email": mem_email,
                    "name": u.get("name", "User") if u else "User",
                    "age": calculate_age(u.get("birth_date") if u else None),
                    "photos": p.get("photos", []) if p else [],
                    "bio": p.get("self_summary", "") if p else ""
                })
                
            results.append({
                "id": duo_id,
                "members": members_data,
                "compatibility": 78 # Standard aesthetic rating
            })
            
        import random
        random.shuffle(results)
        return jsonify({"duos": results}), 200
    except Exception as e:
        print(f"[ERROR discover_duos] {e}")
        return jsonify({"message": str(e)}), 500

@duo_bp.route('/api/duo/swipe', methods=['POST'])
def register_swipe():
    try:
        data = request.get_json()
        swiper_email = data.get("swiperEmail")
        target_duo_id = data.get("targetDuoId")
        action = data.get("action") # "like" or "pass"
        
        if not swiper_email or not target_duo_id or not action:
            return jsonify({"message": "swiperEmail, targetDuoId, and action are required"}), 400
            
        db = get_db()
        my_duo = db.duos.find_one({"members": swiper_email}, sort=[("created_at", -1)])
        if not my_duo:
            return jsonify({"message": "You must be in a duo to swipe"}), 400
            
        my_duo_id = str(my_duo["_id"])
        
        # Save swipe
        db.swipes.update_one(
            {"swiper_email": swiper_email, "swiper_duo_id": my_duo_id, "target_duo_id": target_duo_id},
            {"$set": {
                "action": action,
                "timestamp": datetime.now()
            }},
            upsert=True
        )
        
        # Check for Match (only if action is "like")
        matched = False
        match_id = None
        if action == "like":
            # 1. Has my partner liked the target duo?
            partner_email = [m for m in my_duo["members"] if m != swiper_email][0]
            partner_swipe = db.swipes.find_one({
                "swiper_email": partner_email,
                "swiper_duo_id": my_duo_id,
                "target_duo_id": target_duo_id,
                "action": "like"
            })
            
            if partner_swipe:
                # Yes, our duo collectively likes the target duo.
                # 2. Has the target duo collectively liked our duo?
                target_duo = db.duos.find_one({"_id": ObjectId(target_duo_id)})
                if target_duo:
                    t1_email = target_duo["members"][0]
                    t2_email = target_duo["members"][1]
                    
                    t1_swipe = db.swipes.find_one({
                        "swiper_email": t1_email,
                        "swiper_duo_id": target_duo_id,
                        "target_duo_id": my_duo_id,
                        "action": "like"
                    })
                    t2_swipe = db.swipes.find_one({
                        "swiper_email": t2_email,
                        "swiper_duo_id": target_duo_id,
                        "target_duo_id": my_duo_id,
                        "action": "like"
                    })
                    
                    if t1_swipe and t2_swipe:
                        # Double Match!
                        matched = True
                        # Check if match already recorded
                        existing_match = db.matches.find_one({
                            "$or": [
                                {"duo1_id": my_duo_id, "duo2_id": target_duo_id},
                                {"duo1_id": target_duo_id, "duo2_id": my_duo_id}
                            ]
                        })
                        if not existing_match:
                            res = db.matches.insert_one({
                                "duo1_id": my_duo_id,
                                "duo2_id": target_duo_id,
                                "created_at": datetime.now()
                            })
                            match_id = str(res.inserted_id)
                        else:
                            match_id = str(existing_match["_id"])
                            
        return jsonify({"matched": matched, "matchId": match_id}), 200
    except Exception as e:
        print(f"[ERROR register_swipe] {e}")
        return jsonify({"message": str(e)}), 500

@duo_bp.route('/api/duo/matches', methods=['GET'])
def get_matches():
    try:
        email = request.args.get("email", "")
        if not email:
            return jsonify({"message": "Email is required"}), 400
            
        db = get_db()
        my_duo = db.duos.find_one({"members": email}, sort=[("created_at", -1)])
        if not my_duo:
            return jsonify({"matches": []}), 200
            
        my_duo_id = str(my_duo["_id"])
        
        matches = list(db.matches.find({
            "$or": [
                {"duo1_id": my_duo_id},
                {"duo2_id": my_duo_id}
            ]
        }))
        
        results = []
        for m in matches:
            other_duo_id = m["duo2_id"] if m["duo1_id"] == my_duo_id else m["duo1_id"]
            other_duo = db.duos.find_one({"_id": ObjectId(other_duo_id)})
            
            if not other_duo:
                continue
                
            members_data = []
            for mem_email in other_duo["members"]:
                u = db.users.find_one({"email": mem_email})
                p = db.profiles.find_one({"email": mem_email})
                members_data.append({
                    "email": mem_email,
                    "name": u.get("name", "User") if u else "User",
                    "photos": p.get("photos", []) if p else []
                })
                
            results.append({
                "matchId": str(m["_id"]),
                "partnerDuoId": other_duo_id,
                "members": members_data
            })
            
        return jsonify({"matches": results}), 200
    except Exception as e:
        print(f"[ERROR get_matches] {e}")
        return jsonify({"message": str(e)}), 500

@duo_bp.route('/api/duo/messages', methods=['GET'])
def get_messages():
    try:
        match_id = request.args.get("matchId", "")
        if not match_id:
            return jsonify({"message": "matchId is required"}), 400
            
        db = get_db()
        messages = list(db.group_messages.find({"match_id": match_id}).sort("timestamp", 1))
        
        results = []
        for msg in messages:
            results.append({
                "senderEmail": msg["sender_email"],
                "senderName": msg["sender_name"],
                "text": msg["text"],
                "timestamp": msg["timestamp"].isoformat() if isinstance(msg["timestamp"], datetime) else msg["timestamp"]
            })
            
        return jsonify({"messages": results}), 200
    except Exception as e:
        print(f"[ERROR get_messages] {e}")
        return jsonify({"message": str(e)}), 500

@duo_bp.route('/api/duo/messages', methods=['POST'])
def send_message():
    try:
        data = request.get_json()
        match_id = data.get("matchId")
        sender_email = data.get("senderEmail")
        text = data.get("text")
        
        if not match_id or not sender_email or not text:
            return jsonify({"message": "matchId, senderEmail, and text are required"}), 400
            
        db = get_db()
        u = db.users.find_one({"email": sender_email})
        sender_name = u.get("name", "User") if u else "User"
        
        msg_doc = {
            "match_id": match_id,
            "sender_email": sender_email,
            "sender_name": sender_name,
            "text": text,
            "timestamp": datetime.now()
        }
        
        db.group_messages.insert_one(msg_doc)
        return jsonify({"message": "Message sent!"}), 200
    except Exception as e:
        print(f"[ERROR send_message] {e}")
        return jsonify({"message": str(e)}), 500

@duo_bp.route('/api/duo/interests', methods=['GET'])
def get_interests():
    try:
        email = request.args.get("email", "")
        if not email:
            return jsonify({"message": "Email is required"}), 400
            
        db = get_db()
        my_duo = db.duos.find_one({"members": email}, sort=[("created_at", -1)])
        if not my_duo:
            return jsonify({"incoming_likes": [], "my_likes": []}), 200
            
        my_duo_id = str(my_duo["_id"])
        
        # 1. Incoming Likes: swipes target_duo_id == my_duo_id, action == "like"
        incoming_swipes = list(db.swipes.find({
            "target_duo_id": my_duo_id,
            "action": "like"
        }))
        
        incoming_duos_map = {}
        for s in incoming_swipes:
            swiper_duo_id = s.get("swiper_duo_id")
            if not swiper_duo_id or swiper_duo_id == my_duo_id:
                continue
            incoming_duos_map[swiper_duo_id] = s
            
        incoming_likes = []
        for duo_id_str, swipe_doc in incoming_duos_map.items():
            try:
                other_duo = db.duos.find_one({"_id": ObjectId(duo_id_str)})
                if not other_duo:
                    continue
                members_data = []
                for mem_email in other_duo["members"]:
                    u = db.users.find_one({"email": mem_email})
                    p = db.profiles.find_one({"email": mem_email})
                    members_data.append({
                        "email": mem_email,
                        "name": u.get("name", "User") if u else "User",
                        "age": calculate_age(u.get("birth_date") if u else None),
                        "photos": p.get("photos", []) if p else [],
                        "bio": p.get("self_summary", "") if p else ""
                    })
                incoming_likes.append({
                    "id": duo_id_str,
                    "members": members_data,
                    "compatibility": 82,
                    "timestamp": swipe_doc.get("timestamp").isoformat() if isinstance(swipe_doc.get("timestamp"), datetime) else None
                })
            except Exception as ex:
                print(f"[ERROR parsing incoming duo {duo_id_str}] {ex}")
                
        # 2. My Likes: swipes swiper_duo_id is my_duo_id, action == "like"
        my_swipes = list(db.swipes.find({
            "swiper_duo_id": my_duo_id,
            "action": "like"
        }))
        
        liked_duos_map = {}
        for s in my_swipes:
            target_duo_id = s.get("target_duo_id")
            if not target_duo_id:
                continue
            liked_duos_map[target_duo_id] = s
            
        my_likes = []
        for target_duo_id, swipe_doc in liked_duos_map.items():
            try:
                other_duo = db.duos.find_one({"_id": ObjectId(target_duo_id)})
                if not other_duo:
                    continue
                members_data = []
                for mem_email in other_duo["members"]:
                    u = db.users.find_one({"email": mem_email})
                    p = db.profiles.find_one({"email": mem_email})
                    members_data.append({
                        "email": mem_email,
                        "name": u.get("name", "User") if u else "User",
                        "age": calculate_age(u.get("birth_date") if u else None),
                        "photos": p.get("photos", []) if p else [],
                        "bio": p.get("self_summary", "") if p else ""
                    })
                my_likes.append({
                    "id": target_duo_id,
                    "members": members_data,
                    "compatibility": 80,
                    "timestamp": swipe_doc.get("timestamp").isoformat() if isinstance(swipe_doc.get("timestamp"), datetime) else None
                })
            except Exception as ex:
                print(f"[ERROR parsing liked duo {target_duo_id}] {ex}")
                
        return jsonify({
            "incoming_likes": incoming_likes,
            "my_likes": my_likes
        }), 200
    except Exception as e:
        print(f"[ERROR get_interests] {e}")
        return jsonify({"message": str(e)}), 500

@duo_bp.route('/api/duo/leave', methods=['POST'])
def leave_duo():
    try:
        data = request.get_json()
        email = data.get("email")
        if not email:
            return jsonify({"message": "Email is required"}), 400
            
        db = get_db()
        # Find the latest duo of this user
        my_duo = db.duos.find_one({"members": email}, sort=[("created_at", -1)])
        if my_duo:
            # Delete this duo so the user is solo again
            db.duos.delete_one({"_id": my_duo["_id"]})
            
        return jsonify({"message": "Successfully left the duo."}), 200
    except Exception as e:
        print(f"[ERROR leave_duo] {e}")
        return jsonify({"message": str(e)}), 500
