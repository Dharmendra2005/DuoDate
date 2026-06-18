# pyrefly: ignore [missing-import]
import re
from pymongo import MongoClient
from bson.objectid import ObjectId
from config import Config

# --- InMemory Fallback Database Implementation ---
class InMemoryCollection:
    def __init__(self, name):
        self.name = name
        self.docs = []

    def _matches_val(self, doc_val, query_val):
        if isinstance(query_val, dict):
            for op, val in query_val.items():
                if op == "$ne":
                    if doc_val == val:
                        return False
                elif op == "$regex":
                    options = query_val.get("$options", "")
                    flags = re.IGNORECASE if "i" in options else 0
                    if not re.search(val, str(doc_val), flags):
                        return False
            return True
        return doc_val == query_val

    def _matches(self, doc, query):
        if not query:
            return True
        for key, val in query.items():
            if key == "$and":
                if not all(self._matches(doc, subquery) for subquery in val):
                    return False
            elif key == "$or":
                if not any(self._matches(doc, subquery) for subquery in val):
                    return False
            else:
                # Handle nested array matches (like members)
                if key not in doc:
                    if isinstance(val, dict) and "$ne" in val:
                        continue
                    return False
                
                doc_val = doc[key]
                if isinstance(doc_val, list) and not isinstance(val, list):
                    # Check if query_val is in doc_val list
                    if isinstance(val, dict) and "$ne" in val:
                        if val["$ne"] in doc_val:
                            return False
                    else:
                        if val not in doc_val:
                            return False
                else:
                    if not self._matches_val(doc_val, val):
                        return False
        return True

    def find_one(self, filter=None):
        if filter is None:
            filter = {}
        # Convert _id string to ObjectId if present in filter
        filter_copy = filter.copy()
        if "_id" in filter_copy and isinstance(filter_copy["_id"], str):
            try:
                filter_copy["_id"] = ObjectId(filter_copy["_id"])
            except Exception:
                pass
        for doc in self.docs:
            if self._matches(doc, filter_copy):
                return doc
        return None

    def find(self, filter=None):
        if filter is None:
            filter = {}
        # Convert _id string to ObjectId if present in filter
        filter_copy = filter.copy()
        if "_id" in filter_copy and isinstance(filter_copy["_id"], str):
            try:
                filter_copy["_id"] = ObjectId(filter_copy["_id"])
            except Exception:
                pass
        results = []
        for doc in self.docs:
            if self._matches(doc, filter_copy):
                results.append(doc)
        return InMemoryCursor(results)

    def insert_one(self, doc):
        if "_id" not in doc:
            doc["_id"] = ObjectId()
        self.docs.append(doc)
        class InsertResult:
            def __init__(self, inserted_id):
                self.inserted_id = inserted_id
        return InsertResult(doc["_id"])

    def update_one(self, filter, update, upsert=False):
        doc = self.find_one(filter)
        set_fields = update.get("$set", {})
        if doc:
            for k, v in set_fields.items():
                doc[k] = v
        elif upsert:
            new_doc = {}
            for k, v in filter.items():
                if not k.startswith("$") and not isinstance(v, dict):
                    new_doc[k] = v
            for k, v in set_fields.items():
                new_doc[k] = v
            self.insert_one(new_doc)

    def update_many(self, filter, update):
        set_fields = update.get("$set", {})
        for doc in self.docs:
            if self._matches(doc, filter):
                for k, v in set_fields.items():
                    doc[k] = v

class InMemoryCursor:
    def __init__(self, results):
        self.results = results

    def __iter__(self):
        return iter(self.results)

    def sort(self, key, direction=1):
        reverse = (direction == -1)
        self.results.sort(key=lambda x: x.get(key, ""), reverse=reverse)
        return self

class InMemoryDatabase:
    def __init__(self):
        self.collections = {}
        self.name = "in_memory_fallback"

    def __getattr__(self, name):
        if name not in self.collections:
            self.collections[name] = InMemoryCollection(name)
        return self.collections[name]

# --- Database Connection Singleton Management ---
client = None
db = None

def get_db():
    """Returns the connected MongoDB database instance (singleton) with automatic in-memory fallback"""
    global client, db
    if db is None:
        mongo_uri = Config.MONGO_URI
        try:
            print("[INFO] Attempting to connect to MongoDB Atlas...")
            # Try to connect with a short timeout to prevent application hang
            client = MongoClient(mongo_uri, tlsAllowInvalidCertificates=True, serverSelectionTimeoutMS=1500)
            client.admin.command('ping')
            db = client.get_default_database(default='duodate')
            print(f"[SUCCESS] Connected to MongoDB database: {db.name}")
        except Exception as e:
            print(f"\n[WARNING] Could not connect to MongoDB Atlas: {e}")
            print("[INFO] Falling back to local InMemoryDatabase for test convenience!\n")
            db = InMemoryDatabase()
    return db
