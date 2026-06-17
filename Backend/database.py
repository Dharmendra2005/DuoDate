# pyrefly: ignore [missing-import]
from pymongo import MongoClient
from config import Config

client = None
db = None

def get_db():
    """Returns the connected MongoDB database instance (singleton)"""
    global client, db
    if db is None:
        mongo_uri = Config.MONGO_URI
        # Connect to MongoDB
        client = MongoClient(mongo_uri)
        # Get the default database (specified in URI path, or fallback to 'duodate')
        db = client.get_default_database(default='duodate')
        print(f"Connected to MongoDB database: {db.name}")
    return db
