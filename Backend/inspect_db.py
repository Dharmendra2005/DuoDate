from database import get_db
import json
from bson.objectid import ObjectId

class CustomEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, ObjectId):
            return str(obj)
        import datetime
        if isinstance(obj, datetime.datetime):
            return obj.isoformat()
        return super().default(obj)

def main():
    db = get_db()
    print("=== fallbacks ===")
    print("Database type:", type(db).__name__)
    
    print("\n=== USERS ===")
    for u in db.users.find():
        print(json.dumps(u, cls=CustomEncoder, indent=2))
        
    print("\n=== PROFILES ===")
    for p in db.profiles.find():
        print(json.dumps(p, cls=CustomEncoder, indent=2))
        
    print("\n=== DUOS ===")
    for d in db.duos.find():
        print(json.dumps(d, cls=CustomEncoder, indent=2))
        
    print("\n=== INVITES ===")
    for i in db.duo_invites.find():
        print(json.dumps(i, cls=CustomEncoder, indent=2))

if __name__ == '__main__':
    main()
